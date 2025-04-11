import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import useCategoriesStore from "@/stores/categories.store";
import { DEFAULT_CATEGORIES } from "@/types/Categories";
import { useCategoryRepository } from "@/context/RepositoryContext";

/**
 * Hook for managing categories and subcategories
 * Handles initialization of default categories if none exist
 */
export function useCategories() {
  const categoryRepository = useCategoryRepository();
  const setCombinedCategories = useCategoriesStore((state) => state.setCombinedCategories);
  const { pathname } = useLocation();

  const loadCategories = useCallback(async () => {
    const combinedCategories = await categoryRepository.getCategoriesWithSubcategories();
    setCombinedCategories(combinedCategories);
  }, [categoryRepository, setCombinedCategories]);

  const preloadDefaultCategories = useCallback(async () => {
    const isDashboard = pathname.includes("dashboard");
    try {
      const categoriesExist = await categoryRepository.getAllCategories();
      if (categoriesExist.length > 0 || !isDashboard) {
        loadCategories();
        return;
      }
      // Process categories sequentially with reduce
      await DEFAULT_CATEGORIES.reduce(async (previousPromise, category) => {
        // Wait for the previous category to be processed
        await previousPromise;

        // Add the category
        const categoryId = await categoryRepository.addCategory({
          id: category.name,
          name: category.name,
        });

        if (!categoryId) {
          return Promise.resolve();
        }

        // Map subcategory names to subcategory objects
        const subcategories = category.subCategories.map((subcategoryName) => ({
          id: `${category.name}:${subcategoryName}`,
          name: subcategoryName,
          categoryId,
        }));

        // Add all subcategories
        await categoryRepository.bulkAddSubcategories(subcategories);
        return Promise.resolve();
      }, Promise.resolve());

      loadCategories();
    } catch (error) {
      console.error("Error preloading categories:", error);
    }
  }, [categoryRepository, loadCategories, pathname]);

  return {
    preloadDefaultCategories,
    reloadCategories: loadCategories,
  };
}

export default useCategories;
