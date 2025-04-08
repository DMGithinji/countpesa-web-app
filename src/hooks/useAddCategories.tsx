import { useCallback } from "react";
import { useCategoryRepository } from "@/context/RepositoryContext";
import { deconstructTrCategory } from "@/lib/categoryUtils";
import useCategoriesStore from "@/stores/categories.store";

/**
 * Creates any missing categories in the database
 */
function useAddMissingCategories() {
  const categoryRepository = useCategoryRepository();
  const setCombinedCategories = useCategoriesStore((state) => state.setCombinedCategories);
  const categories = useCategoriesStore((state) => state.categoriesWithSubcategories);

  const refreshCategories = useCallback(async () => {
    const combinedCategories = await categoryRepository.getCategoriesWithSubcategories();
    setCombinedCategories(combinedCategories);
  }, [categoryRepository, setCombinedCategories]);

  const addMissingCategories = useCallback(
    async (categoryToSet: string) => {
      const { category, subcategory } = deconstructTrCategory(categoryToSet);
      const categoryExists = categories.find((c) => c.name === category);
      const subcategExists =
        categoryExists && categoryExists.subcategories.find((sub) => sub.name === subcategory);

      if (!categoryExists) {
        const categId = await categoryRepository.addCategory({
          name: category,
          id: category,
        });

        if (categId && subcategory && !subcategExists) {
          await categoryRepository.addSubcategory({
            name: subcategory,
            categoryId: categId,
            id: `${categId}:${subcategory}`,
          });
          await refreshCategories();
        }
      }

      if (categoryExists?.id && !subcategExists) {
        await categoryRepository.addSubcategory({
          name: subcategory,
          categoryId: categoryExists.id,
          id: `${categoryExists.id}:${subcategory}`,
        });
        await refreshCategories();
      }
    },
    [categories, categoryRepository, refreshCategories]
  );

  return {
    addMissingCategories,
  };
}

export default useAddMissingCategories;
