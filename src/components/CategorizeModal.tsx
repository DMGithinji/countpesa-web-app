import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Transaction } from "@/types/Transaction";
import { Button } from "./ui/button";
import SelectionDropdown from "./SelectionDropDown";
import useCategoriesStore from "@/stores/categories.store";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onSave: (
    transaction: Transaction,
    newCategory: string,
    subcategory: string
  ) => void;
}

const CategorizeModal = ({
  isOpen,
  onClose,
  transaction,
  onSave,
}: CategoryModalProps) => {
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const combinedCategories = useCategoriesStore(
    (state) => state.categoriesWithSubcategories
  );
  const [subcategories, setSubcategories] = useState<string[]>([]);

  // Reset states when transaction changes
  useEffect(() => {
    if (transaction) {
      setCategory(transaction.category || "");
      setSubcategory("");
    }
  }, [transaction, isOpen]);

  const handleSave = () => {
    if (transaction && category) {
      onSave(transaction, category, subcategory);
      onClose();
    }
  };

  // Handler for category change
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory(""); // Reset subcategory when category changes
    const categoryData = combinedCategories.find(
      (category) => category.name === value
    );
    const subCategories = categoryData
      ? categoryData.subcategories.map((s) => s.name)
      : [];
    setSubcategories(subCategories);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        aria-describedby="category-modal-description"
      >
        <DialogHeader>
          <DialogTitle>Categorize Transaction</DialogTitle>
        </DialogHeader>

        {transaction && (
          <div className="space-y-4">
            <TransactionDetails transaction={transaction} />

            <div className="grid grid-cols-2 gap-4">
              {/* Category dropdown */}
              <SelectionDropdown
                title="Category"
                placeholder="Select or create..."
                options={combinedCategories.map((category) => category.name)}
                value={category}
                onChange={handleCategoryChange}
              />

              {/* Subcategory dropdown */}
              <SelectionDropdown
                title="Subcategory"
                placeholder="Select or type..."
                options={subcategories}
                value={subcategory}
                onChange={setSubcategory}
                disabled={!category || category === "Uncategorized"}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!category}>
                Save Category
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CategorizeModal;

const TransactionDetails = ({ transaction }: { transaction: Transaction }) => (
  <div className="flex flex-col gap-2 p-2 rounded-md border-1 bg-gray-50 ">
    <p className="text-sm font-medium">Transaction Details:</p>
    <div className="py-3 px-2 rounded-md">
      <p className="text-sm">
        <span className="font-medium">Amount:</span>{" "}
        <span
          className={`font-semibold ${
            transaction.amount < 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {transaction.amount < 0
            ? `-Ksh ${Math.abs(transaction.amount)}`
            : `Ksh ${transaction.amount}`}
        </span>
      </p>
      <p className="text-sm">
        <span className="font-medium">
          {transaction.amount > 0 ? "Sender" : "Receiver"}:
        </span>{" "}
        {transaction.account}
      </p>
      <p className="text-sm">
        <span className="font-medium">Date:</span>{" "}
        {new Date(transaction.date).toLocaleString()}
      </p>
      <p className="text-sm">
        <span className="font-medium">Description:</span>{" "}
        {transaction.description}
      </p>
    </div>
  </div>
);
