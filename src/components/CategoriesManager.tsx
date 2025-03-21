import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import useCategoriesStore from "@/stores/categories.store";
import useCategories from "@/hooks/useCategories";
import { toast } from "sonner";

// Define our category types for the UI
interface UiSubcategory {
  id: number;
  name: string;
}

interface UiCategory {
  id: number;
  name: string;
  subcategories: UiSubcategory[];
  isExpanded?: boolean;
}

const CategoriesManager = () => {
  const combinedCategories = useCategoriesStore((state) => state.categoriesWithSubcategories);
  const {
    updateCategory,
    deleteCategory,
    updateSubcategory,
    deleteSubcategory,
    reloadCategories
  } = useCategories();

  // Transform combinedCategories into local UI state with isExpanded property
  const [categories, setCategories] = useState<UiCategory[]>([]);

  useEffect(() => {
    // When store data changes, update our local state but preserve expansion state
    if (combinedCategories && combinedCategories.length > 0) {
      setCategories(prev => {
        return combinedCategories.map(category => {
          // Try to find existing category to preserve expansion state
          const existingCategory = prev.find(c => c.id === category.id);
          return {
            ...category,
            isExpanded: existingCategory?.isExpanded || false
          };
        });
      });
    }
  }, [combinedCategories]);

  // State for tracking which category or subcategory is being edited
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<{
    categoryId: number;
    subcategoryId: number;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Toggle expansion of a category
  const toggleCategory = (categoryId: number) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, isExpanded: !category.isExpanded }
          : category
      )
    );
  };

  // Start editing a category
  const startEditingCategory = (category: UiCategory) => {
    setEditingCategoryId(category.id);
    setEditValue(category.name);
  };

  // Start editing a subcategory
  const startEditingSubcategory = (
    categoryId: number,
    subcategory: UiSubcategory
  ) => {
    setEditingSubcategoryId({ categoryId, subcategoryId: subcategory.id });
    setEditValue(subcategory.name);
  };

  // Save edited category
  const saveCategory = async () => {
    if (editingCategoryId !== null) {
      try {
        // Update UI optimistically
        setCategories(
          categories.map((category) =>
            category.id === editingCategoryId
              ? { ...category, name: editValue }
              : category
          )
        );

        // Call repository
        await updateCategory(editingCategoryId, editValue);

        // Clear editing state
        setEditingCategoryId(null);
        setEditValue("");

        // Reload categories to ensure consistency
        await reloadCategories();
      } catch {
        toast.error("Failed to update category");
        await reloadCategories();
      }
    }
  };

  // Save edited subcategory
  const saveSubcategory = async () => {
    if (editingSubcategoryId) {
      try {
        // Update UI optimistically
        setCategories(
          categories.map((category) =>
            category.id === editingSubcategoryId.categoryId
              ? {
                  ...category,
                  subcategories: category.subcategories.map((sub) =>
                    sub.id === editingSubcategoryId.subcategoryId
                      ? { ...sub, name: editValue }
                      : sub
                  ),
                }
              : category
          )
        );

        // Call repository
        await updateSubcategory(editingSubcategoryId.subcategoryId, editValue);

        // Clear editing state
        setEditingSubcategoryId(null);
        setEditValue("");

        // Reload categories to ensure consistency
        await reloadCategories();
      } catch {
        toast.error("Failed to update subcategory");
        await reloadCategories();
      }
    }
  };

  // Delete a category
  const handleDeleteCategory = async (categoryId: number) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        // Update UI optimistically
        setCategories(categories.filter((category) => category.id !== categoryId));

        // Call repository
        await deleteCategory(categoryId);

        // Reload categories to ensure consistency
        await reloadCategories();
      } catch {
        toast.error("Failed to delete category");
        await reloadCategories();
      }
    }
  };

  // Delete a subcategory
  const handleDeleteSubcategory = async (categoryId: number, subcategoryId: number) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      try {
        // Update UI optimistically
        setCategories(
          categories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  subcategories: category.subcategories.filter(
                    (sub) => sub.id !== subcategoryId
                  ),
                }
              : category
          )
        );

        // Call repository
        await deleteSubcategory(subcategoryId);

        // Reload categories to ensure consistency
        await reloadCategories();
      } catch {
        toast.error("Failed to delete subcategory");
        await reloadCategories();
      }
    }
  };

  return (
    <div className="p-0">
      <div className="divide-y">
        {categories.map((category) => (
          <div key={category.id} className="group">
            <div className="py-2 flex items-center justify-between hover:bg-gray-50">
              <div className="flex-1 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 mr-2"
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </Button>

                <div className="flex-1">
                  {editingCategoryId === category.id ? (
                    <div className="flex items-center">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveCategory}
                        className="ml-2"
                      >
                        <Check size={16} className="text-green-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Badge variant="secondary" className="mr-2">
                        {category.subcategories.length}
                      </Badge>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {editingCategoryId !== category.id && (
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditingCategory(category)}
                    className="h-8 w-8 p-0"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              )}
            </div>

            {category.isExpanded && (
              <div className="pl-12 pr-4 pb-4">
                {category.subcategories.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No subcategories</div>
                ) : (
                  <ul className="space-y-2">
                    {category.subcategories.map((subcategory) => (
                      <li
                        key={subcategory.id}
                        className="group/item flex items-center justify-between"
                      >
                        {editingSubcategoryId &&
                        editingSubcategoryId.categoryId === category.id &&
                        editingSubcategoryId.subcategoryId === subcategory.id ? (
                          <div className="flex-1 flex items-center">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={saveSubcategory}
                              className="ml-2"
                            >
                              <Check size={16} className="text-green-500" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span>{subcategory.name}</span>
                            <div className="flex space-x-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  startEditingSubcategory(
                                    category.id,
                                    subcategory
                                  )
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteSubcategory(category.id, subcategory.id)
                                }
                                className="h-8 w-8 p-0 text-red-500"
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesManager;