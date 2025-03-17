import Dexie, { Table }  from "dexie";
import { Transaction } from "../types/Transaction";
import { Category } from "../types/Categories";

class CheckPesa extends Dexie {
  // Tables
  transactions!: Table<Transaction, number>;
  categories!: Table<Category, number>;

  constructor() {
    super('CheckPesaDatabase');

    // Define tables and their schema (primary key and indexes)
    this.version(1).stores({
      transactions: '++code, date, description, status, amount, balance, category, account, createdAt',
      categories: '++name',
    });
  }
}

// Create instance
const db = new CheckPesa();

// Export default for convenience
export default db;
