import categoryRepository from "@/database/CategoryRepository";
import useCategoriesStore from "@/stores/categories.store";
import { deconstructTrCategory } from "@/hooks/useTransactions";

/**
 * Creates any missing categories in the database
 */
export async function addMissingCategories(categoryToSet: string) {
  const { category, subcategory } = deconstructTrCategory(categoryToSet);

  // Get current categories from the store
  const categoriesStore = useCategoriesStore.getState();
  const categories = categoriesStore.categoriesWithSubcategories;

  const categoryExists = categories.find(c => c.name === category);
  const subcategExists = categoryExists && categoryExists.subcategories.find(sub => sub.name === subcategory);

  if (!categoryExists) {
    const categId = await categoryRepository.addCategory({name: category, id: category});
    if (categId && subcategory && !subcategExists) {
      await categoryRepository.addSubcategory({name: subcategory, categoryId: categId, id: `${categId}:${subcategory}`});
      // Directly update store instead of calling a hook
      await updateCategoriesInStore();
    }
  }

  if (categoryExists?.id && !subcategExists) {
    await categoryRepository.addSubcategory({name: subcategory, categoryId: categoryExists.id});
    await updateCategoriesInStore();
  }
}

async function updateCategoriesInStore() {
  const combinedCategories = await categoryRepository.getCategoriesWithSubcategories();
  useCategoriesStore.setState({ categoriesWithSubcategories: combinedCategories });
}
