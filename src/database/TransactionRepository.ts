import { ExtractedTransaction, Transaction } from "../types/Transaction";
import db from "./schema";
import Dexie from "dexie";
import { BaseRepository } from "./BaseRepository";
import { CompositeFilter, Filter, Query } from "@/types/Filters";

export class TransactionRepository extends BaseRepository<Transaction, number> {
  /**
   * Return the Dexie table for transactions
   */
  protected getTable(): Dexie.Table<Transaction, number> {
    return db.transactions;
  }

  /**
   * Add multiple transactions at once
   */
  async bulkAdd(transactions: Transaction[]) {
    return await db.transactions.bulkAdd(transactions, { allKeys: true });
  }

  /**
   * Get all or filtered transactions, optionally with sorting
   * Maintained for backward compatibility
   */
  async getTransactions(
    compositeFilter?: Filter | CompositeFilter | undefined,
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
      filters: compositeFilter,
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
          category: t.category || "Uncategorized",
          transactionType: t.type,
          createdAt: now,
        };
      });

    // Add all transactions to the database
    return await this.bulkAdd(transactions);
  }
}

// Create a singleton instance
const transactionRepository = new TransactionRepository();
export default transactionRepository;
