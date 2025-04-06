import { ExtractedTransaction, MoneyMode, Transaction } from "../types/Transaction";
import db from "./schema";
import Dexie from "dexie";
import { AbstractQuery } from "./AbstractQuery";
import { Filter, Query } from "@/types/Filters";
import { UNCATEGORIZED } from "@/types/Categories";
import { format } from "date-fns";
import { deconstructTrCategory, formatTrCategory } from "@/lib/categoryUtils";

export class TransactionRepository extends AbstractQuery {
  /**
   * Return the Dexie table for transactions
   */
  protected getTable(): Dexie.Table<Transaction, string> {
    return db.transactions;
  }

  async bulkAdd(transactions: Transaction[]) {
    return await db.transactions.bulkAdd(transactions, { allKeys: true });
  }

  async bulkUpdate(updates: Transaction[]) {
    return await db.transactions.bulkPut(updates);
  }

  getBoundaryTransaction(type: 'first' | 'last') {
    return type === 'first' ? db.transactions.orderBy('date').first() : db.transactions.orderBy('date').last();
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
    const {
      sortBy = "date",
      sortDirection = "asc",
      limit,
      offset = 0,
    } = options;

    return this.query({
      filters: filters,
      orderBy: [{ field: sortBy as string, direction: sortDirection }],
      limit,
      offset,
    } as Query);
  }

  getTrId(amount: number, code: string): string {
    return `${amount}_${code}`;
  }

  /**
   * Process and store transactions from MPesa statement
   * Takes API response and converts it to our transaction format
   */
  async processMpesaStatementData(

    mpesaTransactions: ExtractedTransaction[]
  ) {
    const now = Date.now();

    const existingTrs = await this.getTransactions();
    const existingIdsDict = existingTrs.reduce((acc, tr) => {
      acc[this.getTrId(tr.amount, tr.code)] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    const transactions = mpesaTransactions
      .filter((t) => !existingIdsDict[this.getTrId(t.amount, t.code)])
      .map((t) => {
        const trDate = new Date(t.date!);
        return {
          id: this.getTrId(t.amount, t.code),
          code: t.code,
          date: t.date,
          description: t.description,
          status: t.status,
          amount: t.amount,
          account: t.account || 'Unknown',
          balance: t.balance,
          category: t.category || UNCATEGORIZED,
          transactionType: t.type,
          createdAt: now,
          // Add more fields for more expressive querying
          dayOfWeek: format(trDate, 'cccc'), // e.g., "Tuesday"
          hour: format(trDate, 'HH:mm'), // e.g. "14:35"
          mode: t.amount > 0 ? MoneyMode.MoneyIn : MoneyMode.MoneyOut,
        };
      });

    // Add all transactions to the database
    return await this.bulkAdd(transactions);
  }

  async categorizeTransaction(
    trId: string,
    category: string,
  ): Promise<void> {
    db.transactions.update(((trId as unknown) as string), { category });
  }

  async getRelatedTransactions(
    account: string,
    category = UNCATEGORIZED,
    getAll = false
  ) {
    if (getAll) {
      return await db.transactions
        .where({ account })
        .toArray();
    }
    return await db.transactions
      .where({ account, category })
      .toArray();
  }

  /**
   * Helper method to update transactions with a specific category
   */
  async updateTransactionsWithCategories(
    oldCategory: string,
    newCategory: string
  ): Promise<void> {
    // Find all transactions with this category
    const transactions = await db.transactions
      .where("category")
      .startsWith(oldCategory)
      .toArray();

    if (transactions.length === 0) {
      return;
    }

    // Prepare batch update
    const updates = transactions.map((transaction) => {
      const { subcategory } = deconstructTrCategory(transaction.category)
      const updatedCategory = formatTrCategory(newCategory, subcategory)
      return {
        ...transaction,
        category: updatedCategory,
      }
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
    const transactions = await db.transactions
      .where({ category: oldCategorySubcategory })
      .toArray();

    if (transactions.length === 0) {
      return;
    }


    // Prepare batch update
    const updates = transactions.map((tr) => {
      const { category } = deconstructTrCategory(tr.category)
      const newCategoryName = formatTrCategory(category, newCategoryValue)
      return {
        ...tr,
        category: newCategoryName,
        };
      });

    // Perform batch update
    await transactionRepository.bulkUpdate(updates);
  }
}

// Create a singleton instance
const transactionRepository = new TransactionRepository();
export default transactionRepository;
