import { ExtractedTransaction, Transaction } from "../types/Transaction";
import db from "./schema";
import Dexie from "dexie";
import { BaseRepository } from "./BaseRepository";
import { Filter, Query } from "@/types/Filters";
import { UNCATEGORIZED } from "@/types/Categories";
import { deconstructTrCategory, formatTrCategory } from "@/hooks/useTransactions";

export class TransactionRepository extends BaseRepository {
  /**
   * Return the Dexie table for transactions
   */
  protected getTable(): Dexie.Table<Transaction, number> {
    return db.transactions;
  }

  async bulkAdd(transactions: Transaction[]) {
    return await db.transactions.bulkAdd(transactions, { allKeys: true });
  }

  async bulkUpdate(updates: Transaction[]) {
    return await db.transactions.bulkPut(updates);
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

  /**
   * Process and store transactions from MPesa statement
   * Takes API response and converts it to our transaction format
   */
  async processMpesaStatementData(
    mpesaTransactions: ExtractedTransaction[]
  ): Promise<number[]> {
    const now = Date.now();

    const existingTrs = await this.getTransactions();
    const existingIdsDict = existingTrs.reduce((acc, tr) => {
      acc[tr.code] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    const transactions = mpesaTransactions
      .filter((t) => !existingIdsDict[t.code])
      .map((t) => {
        return {
          id: `${t.amount}_${t.code}`,
          code: t.code,
          date: t.date,
          description: t.description,
          status: t.status,
          amount: t.amount,
          account: t.account,
          balance: t.balance,
          category: t.category || UNCATEGORIZED,
          transactionType: t.type,
          createdAt: now,
        };
      });

    // Add all transactions to the database
    return await this.bulkAdd(transactions);
  }

  async categorizeTransaction(
    trId: string,
    category: string,
  ): Promise<void> {
    db.transactions.update(((trId as unknown) as number), { category });
  }

  async getRelatedTransactions(
    account: string,
    category = UNCATEGORIZED
  ) {
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
