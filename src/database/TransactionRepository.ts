import { ExtractedTransaction, Transaction } from '../types/Transaction';
import db from './schema';

export class TransactionRepository {
  /**
   * Add multiple transactions at once
   */
  async bulkAdd(transactions: Omit<Transaction, 'id'>[]): Promise<number[]> {
    return await db.transactions.bulkAdd(transactions, { allKeys: true });
  }

  /**
   * Get all transactions, optionally with sorting
   */
  async getAll(
    options: {
      sortBy?: keyof Transaction;
      sortDirection?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Transaction[]> {
    const { sortBy = 'date', sortDirection = 'desc', limit, offset = 0 } = options;

    let collection = db.transactions.orderBy(sortBy);

    if (sortDirection === 'desc') {
      collection = collection.reverse();
    }

    if (offset > 0) {
      collection = collection.offset(offset);
    }

    if (limit) {
      collection = collection.limit(limit);
    }

    return await collection.toArray();
  }

  /**
   * Get transactions by sender/receiver
   */
  async getBySenderReceiver(name: string): Promise<Transaction[]> {
    return await db.transactions
      .where('account')
      .equals(name)
      .reverse()
      .toArray();
  }

  /**
   * Process and store transactions from MPesa statement
   * Takes API response and converts it to our transaction format
   */
  async processMpesaStatementData(mpesaTransactions: ExtractedTransaction[]): Promise<number[]> {
    const now = Date.now();

    const existingTrs = await this.getAll();
    const existingIdsDict = existingTrs.reduce((acc, tr) => {
      acc[tr.code] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    const transactions = mpesaTransactions
      .filter((t) => !existingIdsDict[t.code])
      .map((t) => {
        return {
          code: t.code,
          date: t.date,
          description: t.description,
          status: t.status,
          amount: t.amount,
          account: t.account,
          balance: t.balance,
          category: t.category || 'Uncategorized',
          transactionType: t.type,
          createdAt: now
        };
      });

    // Add all transactions to the database
    return await this.bulkAdd(transactions);
  }
}

// Create a singleton instance
const transactionRepository = new TransactionRepository();
export default transactionRepository;
