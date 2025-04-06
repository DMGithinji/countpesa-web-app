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

  protected getCategoriesTable(): Dexie.Table<Category, string> {
    return this.isDemo ? db.demoCategories : db.categories;
  }

  protected getSubcategoriesTable(): Dexie.Table<Subcategory, string> {
    return this.isDemo ? db.demoSubcategories : db.subcategories;
  }

  async addCategory(category: Partial<Category>) {
    const exists = await this.getCategoriesTable()
      .where({ name: category.name })
      .first();
    if (exists) {
      return exists.id;
    }
    return await this.getCategoriesTable().add(category as Category);
  }

  async updateCategory(id: string, newName: string) {
    const oldCategory = await this.getCategoriesTable().get(id);

    if (!newName) {
      console.log("New name is empty, returning");
      return;
    }

    if (!oldCategory) {
      throw new Error(`Category ${id} does not exist`);
    }
    await db.transaction(
      "rw",
      [
        this.getCategoriesTable(),
        this.getSubcategoriesTable(),
        db.transactions,
      ],
      async () => {
        const oldCategName = `${oldCategory.name}:`;
        this.transactionRepository.updateTransactionsWithCategories(
          oldCategName,
          newName
        );

        await this.getCategoriesTable().update(id, { name: newName });
      }
    );
  }

  /**
   * Delete a category and all its subcategories.
   */
  async deleteCategory(id: string): Promise<void> {
    const oldCategory = await this.getCategoriesTable().get(id);

    if (!oldCategory) {
      return;
    }
    // Start a transaction to ensure all operations succeed or fail together
    await db.transaction(
      "rw",
      [
        this.getCategoriesTable(),
        this.getSubcategoriesTable(),
        db.transactions,
      ],
      async () => {
        // Set transactions to "Uncategorized" if no replacement provided
        const oldCategName = `${oldCategory.name}:`;
        this.transactionRepository.updateTransactionsWithCategories(
          oldCategName,
          UNCATEGORIZED
        );

        // Delete subcategories of this category
        await this.getSubcategoriesTable().where({ categoryId: id }).delete();

        // Delete the category itself
        await this.getCategoriesTable().delete(id);
      }
    );
  }

  async getAllCategories(): Promise<Category[]> {
    return this.getCategoriesTable().toArray();
  }

  async addSubcategory(subcategory: Subcategory) {
    // Verify that the parent category exists
    const subcategoryExists = await this.getSubcategoriesTable()
      .where({ categoryId: subcategory.categoryId, name: subcategory.name })
      .first();
    if (subcategoryExists) {
      return subcategoryExists.id;
    }

    return this.getSubcategoriesTable().add(subcategory);
  }

  async updateSubcategory(id: string, newSubcategory: string) {
    const existingSubcategory = await this.getSubcategoriesTable().get(id);

    if (!newSubcategory) {
      return;
    }

    if (!existingSubcategory) {
      throw new Error(`Subcategory ${id} does not exist`);
    }

    // If category is changing, verify new category exists
    if (newSubcategory !== existingSubcategory.name) {
      const category = await this.getCategoriesTable().get(
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

    return this.getSubcategoriesTable().update(id, { name: newSubcategory });
  }

  async deleteSubcategory(id: string) {
    const subcategory = await this.getSubcategoriesTable().get(id);

    if (!subcategory) {
      throw new Error(`Subcategory ${id} does not exist`);
    }

    // await db.transaction('rw', [this.getSubcategoriesTable(), db.transactions], async () => {
    const category = await this.getCategoriesTable().get(
      subcategory.categoryId
    );
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
    await this.getSubcategoriesTable().delete(id);
    // });
  }

  async getAllSubcategories(): Promise<Subcategory[]> {
    return this.getSubcategoriesTable().toArray();
  }

  /**
   * Get all categories with their subcategories
   * Returns a map of category names to arrays of subcategories
   */
  async getCategoriesWithSubcategories(): Promise<CombinedCategory[]> {
    const categories = await this.getAllCategories();

    const result = await Promise.all(
      sortBy(categories, "name").map(async (category) => {
        const subcategories = await this.getSubcategoriesTable()
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
