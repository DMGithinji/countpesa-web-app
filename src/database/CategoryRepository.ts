import { Category, CombinedCategory, Subcategory, UNCATEGORIZED } from "@/types/Categories";
import db from "./schema";
import transactionRepository from "./TransactionRepository";
import { formatTrCategory } from "@/hooks/useTransactions";
import { sortBy } from "@/lib/utils";

export class CategoryRepository {

  async addCategory(category: Partial<Category>) {
    const exists = await db.categories.where({ name: category.name }).first();
    if (exists) {
      return exists.id;
    }
    return await db.categories.add(category as Category);
  }

  async updateCategory(id: string, newName: string) {
    const oldCategory = await db.categories.get(id);

    if (!newName) {
      console.log('New name is empty, returning');
      return;
    }

    if (!oldCategory) {
      throw new Error(`Category ${id} does not exist`);
    }
    await db.transaction('rw', [db.categories, db.subcategories, db.transactions], async () => {
      const oldCategName = `${oldCategory.name}:`;
      transactionRepository.updateTransactionsWithCategories(oldCategName, newName)

      await db.categories.update(id, { name: newName });
    });
  }

  /**
   * Delete a category and all its subcategories.
   */
  async deleteCategory(id: string): Promise<void> {
    const oldCategory = await db.categories.get(id);

    if (!oldCategory) {
      return
    }
    // Start a transaction to ensure all operations succeed or fail together
    await db.transaction('rw', [db.categories, db.subcategories, db.transactions], async () => {

      // Set transactions to "Uncategorized" if no replacement provided
      const oldCategName = `${oldCategory.name}:`;
      transactionRepository.updateTransactionsWithCategories(oldCategName, UNCATEGORIZED)

      // Delete subcategories of this category
      await db.subcategories.where({ categoryId: id }).delete();

      // Delete the category itself
      await db.categories.delete(id);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return db.categories.toArray();
  }

  async addSubcategory(subcategory: Omit<Subcategory, "id">) {
    // Verify that the parent category exists
    const subcategoryExists = await db.subcategories.where({ categoryId: subcategory.categoryId, name: subcategory.name }).first();
    if (subcategoryExists) {
      return subcategoryExists.id;
    }

    return db.subcategories.add(subcategory);
  }

  async updateSubcategory(id: string, newSubcategory: string) {
    const existingSubcategory = await db.subcategories.get(id);

    if (!newSubcategory) {
      return;
    }

    if (!existingSubcategory) {
      throw new Error(`Subcategory ${id} does not exist`);
    }

    // If category is changing, verify new category exists
    if (newSubcategory !== existingSubcategory.name) {
      const category = await db.categories.get(existingSubcategory.categoryId);
      if (!category) {
        throw new Error(`Parent category ${existingSubcategory.categoryId} does not exist`);
      }

      // If only name is changing, update transactions
      const oldCategorySubcategory = formatTrCategory(category.name, existingSubcategory.name);

      await transactionRepository.updateTransactionsSubcategory(
        oldCategorySubcategory,
        newSubcategory
      );
    }

    return db.subcategories.update(id, { name: newSubcategory });
  }

  async deleteSubcategory(id: string) {
    const subcategory = await db.subcategories.get(id);

    if (!subcategory) {
      throw new Error(`Subcategory ${id} does not exist`);
    }

    // await db.transaction('rw', [db.subcategories, db.transactions], async () => {
      const category = await db.categories.get(subcategory.categoryId);
      if (!category) {
        throw new Error(`Parent category ${subcategory.categoryId} does not exist`);
      }

      // Get the category:subcategory string for this subcategory
      const categorySubcategory = formatTrCategory(category.name, subcategory.name);

      // Update transactions to use just the parent category without subcategory
      await transactionRepository.updateTransactionsSubcategory(
        categorySubcategory,
        ''
      );

      // Delete the subcategory
      await db.subcategories.delete(id);
    // });
  }

  async getAllSubcategories(): Promise<Subcategory[]> {
    return db.subcategories.toArray();
  }

  /**
   * Get all categories with their subcategories
   * Returns a map of category names to arrays of subcategories
   */
  async getCategoriesWithSubcategories(): Promise<CombinedCategory[]> {
    const categories = await this.getAllCategories();

    const result = await Promise.all(sortBy(categories, 'name').map(async category => {
      const subcategories = await db.subcategories.where({ categoryId: category.id }).toArray();
      return {
        ...category,
        subcategories: sortBy(subcategories, 'name')
      }
    }));

    return result;
  }
}

// Create a singleton instance
const categoryRepository = new CategoryRepository();
export default categoryRepository;
