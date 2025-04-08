import Dexie from "dexie";
import { format } from "date-fns";
import { Filter, Query } from "@/types/Filters";
import { UNCATEGORIZED } from "@/types/Categories";
import { deconstructTrCategory, formatTrCategory } from "@/lib/categoryUtils";
import { ExtractedTransaction, MoneyMode, Transaction } from "../types/Transaction";
import db from "./schema";
import { AbstractQuery } from "./AbstractQuery";

const getTrId = (amount: number, code: string): string => {
  return `${amount}_${code}`;
};
export default class TransactionRepository extends AbstractQuery {
  protected tableDb: Dexie.Table<Transaction, string, Transaction>;

  constructor(isDemo: boolean = false) {
    super();
    this.tableDb = isDemo ? db.demoTransactions : db.transactions;
  }

  /**
   * Return the Dexie table for transactions
   */
  protected getTable(): Dexie.Table<Transaction, string> {
    return this.tableDb;
  }

  async bulkAdd(transactions: Transaction[]) {
    return this.tableDb.bulkAdd(transactions, { allKeys: true });
  }

  async bulkUpdate(updates: Transaction[]) {
    return this.tableDb.bulkPut(updates);
  }

  /**
   * Get all or filtered transactions, optionally with sorting
   * Maintained for backward compatibility
   */
  async getTransactions(
    filters?: Filter[] | undefined,
    options: {
      sortBy?: keyof Transaction;
      sortDirection?: "asc" | "desc";
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Transaction[]> {
    const { sortBy = "date", sortDirection = "asc", limit, offset = 0 } = options;

    return this.query({
      filters,
      orderBy: [{ field: sortBy as string, direction: sortDirection }],
      limit,
      offset,
    } as Query);
  }

  /**
   * Process and store transactions from MPesa statement
   * Takes API response and converts it to our transaction format
   */
  async processMpesaStatementData(
    mpesaTransactions: ExtractedTransaction[],
    accountTransactionDict?: Record<string, string>
  ) {
    const now = Date.now();

    const existingTrs = await this.getTransactions();
    const existingIdsDict = existingTrs.reduce(
      (acc, tr) => {
        acc[getTrId(tr.amount, tr.code)] = true;
        return acc;
      },
      {} as { [key: string]: boolean }
    );

    const transactions = mpesaTransactions
      .filter((t) => !existingIdsDict[getTrId(t.amount, t.code)])
      .map((t) => {
        const trDate = new Date(t.date!);
        return {
          id: getTrId(t.amount, t.code),
          code: t.code,
          date: t.date,
          description: t.description,
          status: t.status,
          amount: t.amount,
          account: t.account || "Unknown",
          balance: t.balance,
          category: t.category || accountTransactionDict?.[t.account] || UNCATEGORIZED,
          transactionType: t.type,
          createdAt: now,
          // Add more fields for more expressive querying
          dayOfWeek: format(trDate, "cccc"), // e.g., "Tuesday"
          hour: format(trDate, "HH:mm"), // e.g. "14:35"
          mode: t.amount > 0 ? MoneyMode.MoneyIn : MoneyMode.MoneyOut,
        };
      });

    // Add all transactions to the database
    return this.bulkAdd(transactions);
  }

  async categorizeTransaction(trId: string, category: string): Promise<void> {
    this.tableDb.update(trId as unknown as string, { category });
  }

  async getRelatedTransactions(account: string, category = UNCATEGORIZED, getAll = false) {
    if (getAll) {
      return this.tableDb.where({ account }).toArray();
    }
    return this.tableDb.where({ account, category }).toArray();
  }

  /**
   * Helper method to update transactions with a specific category
   */
  async updateTransactionsWithCategories(oldCategory: string, newCategory: string): Promise<void> {
    // Find all transactions with this category
    const transactions = await this.tableDb.where("category").startsWith(oldCategory).toArray();

    if (transactions.length === 0) {
      return;
    }

    // Prepare batch update
    const updates = transactions.map((transaction) => {
      const { subcategory } = deconstructTrCategory(transaction.category);
      const updatedCategory = formatTrCategory(newCategory, subcategory);
      return {
        ...transaction,
        category: updatedCategory,
      };
    });

    // Perform batch update
    await this.bulkUpdate(updates);
  }

  /**
   * Helper method to update transactions with a specific category:subcategory combination
   */
  async updateTransactionsSubcategory(
    oldCategorySubcategory: string,
    newCategoryValue: string
  ): Promise<void> {
    // Find all transactions with this category:subcategory
    const transactions = await this.tableDb.where({ category: oldCategorySubcategory }).toArray();

    if (transactions.length === 0) {
      return;
    }

    // Prepare batch update
    const updates = transactions.map((tr) => {
      const { category } = deconstructTrCategory(tr.category);
      const newCategoryName = formatTrCategory(category, newCategoryValue);
      return {
        ...tr,
        category: newCategoryName,
      };
    });

    // Perform batch update
    await this.bulkUpdate(updates);
  }

  clearAllData() {
    return Promise.all([
      this.tableDb.clear(),
      db.analysisReports.clear(),
      db.categories.clear(),
      db.subcategories.clear(),
    ]);
  }
}
