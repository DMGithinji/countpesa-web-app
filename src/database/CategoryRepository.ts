import { Category, CombinedCategory, Subcategory, UNCATEGORIZED } from "@/types/Categories";
import db from "./schema";
import transactionRepository from "./TransactionRepository";
import { formatTrCategory } from "@/hooks/useTransactions";

export class CategoryRepository {

  async addCategory(category: Omit<Category, "id">) {
    const exists = await db.categories.where({ name: category.name }).first();
    if (exists) {
      return;
    }
    return await db.categories.add(category as Category);
  }

  async updateCategory(id: number, newName: string) {
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
  async deleteCategory(id: number): Promise<void> {
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
    const categoryExists = await db.categories.get(subcategory.categoryId);
    if (!categoryExists) {
      throw new Error(`Parent category ${subcategory.categoryId} does not exist`);
    }
    const subcategoryExists = await db.subcategories.where({ categoryId: subcategory.categoryId, name: subcategory.name }).first();
    if (subcategoryExists) {
      return;
    }

    return db.subcategories.add(subcategory);
  }

  async updateSubcategory(id: number, newName: string) {
    const existingSubcategory = await db.subcategories.get(id);

    if (!newName) {
      return;
    }

    if (!existingSubcategory) {
      throw new Error(`Subcategory ${id} does not exist`);
    }

    // If category is changing, verify new category exists
    if (newName !== existingSubcategory.name) {
      const category = await db.categories.get(existingSubcategory.categoryId);
      if (!category) {
        throw new Error(`Parent category ${existingSubcategory.categoryId} does not exist`);
      }

      // If only name is changing, update transactions
      const oldCategorySubcategory = formatTrCategory(category.name, existingSubcategory.name);
      const newCategorySubcategory = formatTrCategory(category.name, newName);

      console.log({ oldCategorySubcategory, newCategorySubcategory })

      await transactionRepository.updateTransactionsWithCategorySubcategory(
        oldCategorySubcategory,
        newCategorySubcategory
      );
    }

    return db.subcategories.update(id, { name: newName });
  }

  async deleteSubcategory(id: number) {
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
      await transactionRepository.updateTransactionsWithCategorySubcategory(
        categorySubcategory,
        category.name
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

    const result = await Promise.all(categories.map(async category => ({
      ...category,
      subcategories: await db.subcategories.where({ categoryId: category.id }).toArray()
    })));

    return result;
  }
}

// Create a singleton instance
const categoryRepository = new CategoryRepository();
export default categoryRepository;
