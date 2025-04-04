import Dexie, { Table }  from "dexie";
import { Transaction } from "../types/Transaction";
import { Category, Subcategory } from "../types/Categories";
import { AnalysisReport } from "@/types/AITools";

class CheckPesa extends Dexie {
  // Tables
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;
  subcategories!: Table<Subcategory, string>;
  analysisReports!: Table<AnalysisReport, string>;

  constructor() {
    super('CheckPesaDatabase');

    // Define tables and their schema (primary key and indexes)
    this.version(1).stores({
      transactions: 'id, code, date, description, status, amount, balance, category, account, createdAt, year, month, dayOfWeek, hour, mode',
      categories: 'id, name',
      subcategories: 'id, name, categoryId, [categoryId+name]',
      analysisReports: 'id, report, createdAt',
    });

    this.version(2).stores({
      transactions: 'id, date, [date+category], [date+account], amount, category, account, createdAt, dayOfWeek, hour, mode, code',
      categories: 'id, name',
      subcategories: 'id, name, categoryId, [categoryId+name]',
      analysisReports: 'id, report, createdAt',
    });
  }
}

// Create instance
const db = new CheckPesa();

// Export default for convenience
export default db;
