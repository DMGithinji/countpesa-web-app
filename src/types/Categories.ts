export interface Category {
  id?: number;
  name: string;
}

export interface Subcategory {
  id?: number;
  name: string;
  categoryId: number;
}

export interface CombinedCategory extends Category {
  subcategories: Subcategory[];
}

export const UNCATEGORIZED = 'Uncategorized';