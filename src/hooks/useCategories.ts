import { useCallback } from 'react';
import useCategoriesStore from '@/stores/categories.store';
import { DEFAULT_CATEGORIES, Subcategory } from '@/types/Categories';
import { useCategoryRepository } from '@/context/DBContext';


/**
 * Hook for managing categories and subcategories
 * Handles initialization of default categories if none exist
 */
export function useCategories() {
  const categoryRepository = useCategoryRepository();
  const setCombinedCategories = useCategoriesStore(state => state.setCombinedCategories);

  const preloadDefaultCategories = useCallback(async () => {
    try {
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
    } catch (error) {
      console.error("Error preloading categories:", error);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    const combinedCategories = await categoryRepository.getCategoriesWithSubcategories();
    setCombinedCategories(combinedCategories);
  }, [categoryRepository, setCombinedCategories]);

  return {
    preloadDefaultCategories,
    reloadCategories: loadCategories,
  };
}

export default useCategories;
