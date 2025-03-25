import { create } from 'zustand';
import { CombinedCategory } from "@/types/Categories";

interface CategoriesState {
  categoriesWithSubcategories: CombinedCategory[];
  setCombinedCategories: (categories: CombinedCategory[]) => void;
}
const useCategoriesStore = create<CategoriesState>((set) => ({
  categoriesWithSubcategories: [],
  setCombinedCategories: (categories) => set({ categoriesWithSubcategories: categories }),
}));

export default useCategoriesStore;
