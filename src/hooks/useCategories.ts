import { useCallback } from 'react';
import { useEffect } from 'react';
import useCategoriesStore from '@/stores/categories.store';
import categoryRepository from '@/database/CategoryRepository';
import { Subcategory } from '@/types/Categories';

/**
 * Default categories and subcategories to preload if none exist
 */
const preloadedCategories = [
  {
    name: "Bills & Utilities",
    subcategories: [
      "Electricity", "Gas", "House Help", "Internet",
      "Phone Bill", "Rent", "Water"
    ]
  },
  {
    name: "Debt Financing",
    subcategories: ["Bank Loans", "Credit Card"]
  },
  {
    name: "Entertainment",
    subcategories: ["Movies", "Music", "Games"]
  },
  {
    name: "Family",
    subcategories: ["Childcare", "Education"]
  },
  {
    name: "Fitness",
    subcategories: ["Gym", "Sports"]
  },
  {
    name: "Food",
    subcategories: ["Groceries", "Restaurants"]
  },
  {
    name: "Gifts & Contributions",
    subcategories: ["Charity", "Gifts"]
  },
  {
    name: "Health",
    subcategories: ["Doctor", "Pharmacy"]
  }
];

/**
 * Hook for managing categories and subcategories
 * Handles initialization of default categories if none exist
 */
export function useCategories() {
  const {
    setCombinedCategories
  } = useCategoriesStore();

  const preloadDefaultCategories = async () => {
    try {
      console.log("Preloading default categories and subcategories");
      for (const category of preloadedCategories) {
        // Add the category
        const categoryId = await categoryRepository.addCategory({
          name: category.name
        });

        // Add subcategories for this category
        for (const subcategoryName of category.subcategories) {
          await categoryRepository.addSubcategory({
            name: subcategoryName,
            categoryId
          } as Subcategory);
        }
      }

      console.log("Default categories and subcategories preloaded successfully");
    } catch (error) {
      console.error("Error preloading categories:", error);
    }
  };

  const loadCategories = useCallback(async () => {
    const combinedCategories = await categoryRepository.getCategoriesWithSubcategories();

    if (!combinedCategories || combinedCategories.length === 0) {
      // No categories found, preload defaults
      await preloadDefaultCategories();
      // Reload after preloading
      loadCategories();
      return;
    }

    // Set the combined categories in the store
    setCombinedCategories(combinedCategories);
  }, [setCombinedCategories]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
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
