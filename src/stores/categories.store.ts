import { create } from 'zustand';
import { CombinedCategory } from "@/types/Categories";

// Store interface - minimal version that just holds state
interface CategoriesState {
  categoriesWithSubcategories: CombinedCategory[];
  setCombinedCategories: (categories: CombinedCategory[]) => void;
}
// Create the minimal Zustand store
const useCategoriesStore = create<CategoriesState>((set) => ({
  categoriesWithSubcategories: [],
  setCombinedCategories: (categories) => set({ categoriesWithSubcategories: categories }),
}));

export default useCategoriesStore;
