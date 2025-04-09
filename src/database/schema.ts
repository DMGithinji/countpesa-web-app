import Dexie, { Table } from "dexie";
import { AnalysisReport } from "@/prompts/types";
import { Transaction } from "../types/Transaction";
import { Category, Subcategory } from "../types/Categories";

class CheckPesa extends Dexie {
  // Regular tables
  transactions!: Table<Transaction, string>;

  categories!: Table<Category, string>;

  subcategories!: Table<Subcategory, string>;

  analysisReports!: Table<AnalysisReport, string>;

  // Demo tables
  demoTransactions!: Table<Transaction, string>;

  demoCategories!: Table<Category, string>;

  demoSubcategories!: Table<Subcategory, string>;

  demoAnalysisReports!: Table<AnalysisReport, string>;

  constructor() {
    super("CheckPesaDatabase");

    // Define tables and their schema (primary key and indexes)
    this.version(1).stores({
      transactions:
        "id, code, date, description, status, amount, balance, category, account, createdAt, year, month, dayOfWeek, hour, mode",
      categories: "id, name",
      subcategories: "id, name, categoryId, [categoryId+name]",
      analysisReports: "id, report, createdAt",
    });

    this.version(2).stores({
      transactions:
        "id, date, [date+category], [date+account], amount, category, account, createdAt, dayOfWeek, hour, mode, code",
      categories: "id, name",
      subcategories: "id, name, categoryId, [categoryId+name]",
      analysisReports: "id, report, createdAt",
    });

    this.version(3).stores({
      transactions:
        "id, date, [date+category], [date+account], amount, category, account, createdAt, dayOfWeek, hour, mode, code",
      categories: "id, name",
      subcategories: "id, name, categoryId, [categoryId+name]",
      analysisReports: "id, report, createdAt",

      demoTransactions:
        "id, date, [date+category], [date+account], amount, category, account, createdAt, dayOfWeek, hour, mode, code",
      demoCategories: "id, name",
      demoSubcategories: "id, name, categoryId, [categoryId+name]",
      demoAnalysisReports: "id, report, createdAt",
    });
  }
}

// Create instance
const db = new CheckPesa();

// Export default for convenience
export default db;
