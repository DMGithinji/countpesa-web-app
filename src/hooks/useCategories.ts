import { useCallback } from 'react';
import { useEffect } from 'react';
import useCategoriesStore from '@/stores/categories.store';
import categoryRepository from '@/database/CategoryRepository';
import { DEFAULT_CATEGORIES, Subcategory } from '@/types/Categories';


/**
 * Hook for managing categories and subcategories
 * Handles initialization of default categories if none exist
 */
export function useCategories() {
  const setCombinedCategories = useCategoriesStore(state => state.setCombinedCategories);

  const preloadDefaultCategories = useCallback(async () => {
    try {
      console.log("Preloading default categories and subcategories");
      for (const category of DEFAULT_CATEGORIES) {
        // Add the category
        const categoryId = await categoryRepository.addCategory({
          id: category.name,
          name: category.name
        });

        // Add subcategories for this category
        for (const subcategoryName of category.subCategories) {
          await categoryRepository.addSubcategory({
            id: `${category.name}:${subcategoryName}`,
            name: subcategoryName,
            categoryId
          } as Subcategory);
        }
      }
      loadCategories();
      console.log("Default categories and subcategories preloaded successfully");
    } catch (error) {
      console.error("Error preloading categories:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const combinedCategories = await categoryRepository.getCategoriesWithSubcategories();
    setCombinedCategories(combinedCategories);
  }, [setCombinedCategories]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    preloadDefaultCategories,
    reloadCategories: loadCategories,
    addCategory: categoryRepository.addCategory,
    updateCategory: categoryRepository.updateCategory,
    deleteCategory: categoryRepository.deleteCategory,
    addSubcategory: categoryRepository.addSubcategory,
    updateSubcategory: categoryRepository.updateSubcategory,
    deleteSubcategory: categoryRepository.deleteSubcategory
  };
}

export default useCategories;
