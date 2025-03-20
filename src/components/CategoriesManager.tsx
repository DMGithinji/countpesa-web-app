import { useState } from "react";
import { Check, ChevronDown, ChevronUp, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Define our category types
interface Subcategory {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
  isExpanded?: boolean;
}

const CategoriesManager = () => {
  // Initial categories data
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Bills & Utilities",
      isExpanded: true,
      subcategories: [
        { id: "1-1", name: "Electricity" },
        { id: "1-2", name: "Gas" },
        { id: "1-3", name: "House Help" },
        { id: "1-4", name: "Internet" },
        { id: "1-5", name: "Phone Bill" },
        { id: "1-6", name: "Rent" },
        { id: "1-7", name: "Water" },
      ],
    },
    {
      id: "2",
      name: "Debt Financing",
      isExpanded: false,
      subcategories: [
        { id: "2-1", name: "Bank Loans" },
        { id: "2-2", name: "Credit Card" },
      ],
    },
    {
      id: "3",
      name: "Entertainment",
      isExpanded: false,
      subcategories: [
        { id: "3-1", name: "Movies" },
        { id: "3-2", name: "Music" },
        { id: "3-3", name: "Games" },
      ],
    },
    {
      id: "4",
      name: "Family",
      isExpanded: false,
      subcategories: [
        { id: "4-1", name: "Childcare" },
        { id: "4-2", name: "Education" },
      ],
    },
    {
      id: "5",
      name: "Fitness",
      isExpanded: false,
      subcategories: [
        { id: "5-1", name: "Gym" },
        { id: "5-2", name: "Sports" },
      ],
    },
    {
      id: "6",
      name: "Food",
      isExpanded: false,
      subcategories: [
        { id: "6-1", name: "Groceries" },
        { id: "6-2", name: "Restaurants" },
      ],
    },
    {
      id: "7",
      name: "Gifts & Contributions",
      isExpanded: false,
      subcategories: [
        { id: "7-1", name: "Charity" },
        { id: "7-2", name: "Gifts" },
      ],
    },
    {
      id: "8",
      name: "Health",
      isExpanded: false,
      subcategories: [
        { id: "8-1", name: "Doctor" },
        { id: "8-2", name: "Pharmacy" },
      ],
    },
  ]);

  // State for tracking which category or subcategory is being edited
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<{
    categoryId: string;
    subcategoryId: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Toggle expansion of a category
  const toggleCategory = (categoryId: string) => {
    setCategories(
      categories.map((category) =>
        category.id === categoryId
          ? { ...category, isExpanded: !category.isExpanded }
          : category
      )
    );
  };

  // Start editing a category
  const startEditingCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditValue(category.name);
  };

  // Start editing a subcategory
  const startEditingSubcategory = (
    categoryId: string,
    subcategory: Subcategory
  ) => {
    setEditingSubcategoryId({ categoryId, subcategoryId: subcategory.id });
    setEditValue(subcategory.name);
  };

  // Save edited category
  const saveCategory = () => {
    if (editingCategoryId) {
      setCategories(
        categories.map((category) =>
          category.id === editingCategoryId
            ? { ...category, name: editValue }
            : category
        )
      );
      setEditingCategoryId(null);
      setEditValue("");
    }
  };

  // Save edited subcategory
  const saveSubcategory = () => {
    if (editingSubcategoryId) {
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
      setEditingSubcategoryId(null);
      setEditValue("");
    }
  };

  // Delete a category
  const deleteCategory = (categoryId: string) => {
    setCategories(categories.filter((category) => category.id !== categoryId));
  };

  // Delete a subcategory
  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
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
                    onClick={() => deleteCategory(category.id)}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              )}
            </div>

            {category.isExpanded && (
              <div className="pl-12 pr-4 pb-4">
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
                                deleteSubcategory(category.id, subcategory.id)
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
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesManager;
