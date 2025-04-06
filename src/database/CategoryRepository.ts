import {
  Category,
  CombinedCategory,
  Subcategory,
  UNCATEGORIZED,
} from "@/types/Categories";
import db from "./schema";
import TransactionRepository from "./TransactionRepository";
import { sortBy } from "@/lib/utils";
import { formatTrCategory } from "@/lib/categoryUtils";
import Dexie from "dexie";

export default class CategoryRepository {
  private isDemo: boolean;
  private transactionRepository: TransactionRepository;

  constructor(isDemo: boolean = false) {
    this.isDemo = isDemo;
    this.transactionRepository = new TransactionRepository(isDemo);
  }

  protected get categoriesTable(): Dexie.Table<Category, string> {
    return this.isDemo ? db.demoCategories : db.categories;
  }

  protected get subcategoriesTable(): Dexie.Table<Subcategory, string> {
    return this.isDemo ? db.demoSubcategories : db.subcategories;
  }

  bulkAddCategories(categories: Category[]) {
    return this.categoriesTable.bulkPut(categories);
  }

  bulkAddSubcategories(subcategories: Subcategory[]) {
    return this.subcategoriesTable.bulkPut(subcategories);
  }

  async addCategory(category: Partial<Category>) {
    const exists = await this.categoriesTable
      .where({ name: category.name })
      .first();
    if (exists) {
      return exists.id;
    }
    return await this.categoriesTable.add(category as Category);
  }

  async updateCategory(id: string, newName: string) {
    const oldCategory = await this.categoriesTable.get(id);

    if (!newName) {
      console.log("New name is empty, returning");
      return;
    }

    if (!oldCategory) {
      throw new Error(`Category ${id} does not exist`);
    }
    await db.transaction(
      "rw",
      [this.categoriesTable, this.subcategoriesTable, db.transactions],
      async () => {
        const oldCategName = `${oldCategory.name}:`;
        this.transactionRepository.updateTransactionsWithCategories(
          oldCategName,
          newName
        );

        await this.categoriesTable.update(id, { name: newName });
      }
    );
  }

  /**
   * Delete a category and all its subcategories.
   */
  async deleteCategory(id: string): Promise<void> {
    const oldCategory = await this.categoriesTable.get(id);

    if (!oldCategory) {
      return;
    }
    // Start a transaction to ensure all operations succeed or fail together
    await db.transaction(
      "rw",
      [this.categoriesTable, this.subcategoriesTable, db.transactions],
      async () => {
        // Set transactions to "Uncategorized" if no replacement provided
        const oldCategName = `${oldCategory.name}:`;
        this.transactionRepository.updateTransactionsWithCategories(
          oldCategName,
          UNCATEGORIZED
        );

        // Delete subcategories of this category
        await this.subcategoriesTable.where({ categoryId: id }).delete();

        // Delete the category itself
        await this.categoriesTable.delete(id);
      }
    );
  }

  async getAllCategories(): Promise<Category[]> {
    return this.categoriesTable.toArray();
  }

  async addSubcategory(subcategory: Subcategory) {
    // Verify that the parent category exists
    const subcategoryExists = await this.subcategoriesTable
      .where({ categoryId: subcategory.categoryId, name: subcategory.name })
      .first();
    if (subcategoryExists) {
      return subcategoryExists.id;
    }

    return this.subcategoriesTable.add(subcategory);
  }

  async updateSubcategory(id: string, newSubcategory: string) {
    const existingSubcategory = await this.subcategoriesTable.get(id);

    if (!newSubcategory) {
      return;
    }

    if (!existingSubcategory) {
      throw new Error(`Subcategory ${id} does not exist`);
    }

    // If category is changing, verify new category exists
    if (newSubcategory !== existingSubcategory.name) {
      const category = await this.categoriesTable.get(
        existingSubcategory.categoryId
      );
      if (!category) {
        throw new Error(
          `Parent category ${existingSubcategory.categoryId} does not exist`
        );
      }

      // If only name is changing, update transactions
      const oldCategorySubcategory = formatTrCategory(
        category.name,
        existingSubcategory.name
      );

      await this.transactionRepository.updateTransactionsSubcategory(
        oldCategorySubcategory,
        newSubcategory
      );
    }

    return this.subcategoriesTable.update(id, { name: newSubcategory });
  }

  async deleteSubcategory(id: string) {
    const subcategory = await this.subcategoriesTable.get(id);

    if (!subcategory) {
      throw new Error(`Subcategory ${id} does not exist`);
    }

    // await db.transaction('rw', [this.subcategoriesTable, db.transactions], async () => {
    const category = await this.categoriesTable.get(subcategory.categoryId);
    if (!category) {
      throw new Error(
        `Parent category ${subcategory.categoryId} does not exist`
      );
    }

    // Get the category:subcategory string for this subcategory
    const categorySubcategory = formatTrCategory(
      category.name,
      subcategory.name
    );

    // Update transactions to use just the parent category without subcategory
    await this.transactionRepository.updateTransactionsSubcategory(
      categorySubcategory,
      ""
    );

    // Delete the subcategory
    await this.subcategoriesTable.delete(id);
    // });
  }

  async getAllSubcategories(): Promise<Subcategory[]> {
    return this.subcategoriesTable.toArray();
  }

  /**
   * Get all categories with their subcategories
   * Returns a map of category names to arrays of subcategories
   */
  async getCategoriesWithSubcategories(): Promise<CombinedCategory[]> {
    const categories = await this.getAllCategories();

    const result = await Promise.all(
      sortBy(categories, "name").map(async (category) => {
        const subcategories = await this.subcategoriesTable
          .where({ categoryId: category.id })
          .toArray();
        return {
          ...category,
          subcategories: sortBy(subcategories, "name"),
        };
      })
    );

    return result;
  }
}
