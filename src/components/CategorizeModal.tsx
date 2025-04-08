import { useEffect, useState } from "react";
import { Transaction } from "@/types/Transaction";
import useCategoriesStore from "@/stores/categories.store";
import { UNCATEGORIZED } from "@/types/Categories";
import { useWriteTransactions } from "@/hooks/useWriteTransactions";
import { formatCurrency } from "@/lib/utils";
import { deconstructTrCategory, formatTrCategory } from "@/lib/categoryUtils";
import SimilarTransactionsAccordion from "./SimilarTransactionsAccordion";
import SelectionDropdown from "./SelectionDropDown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

function TransactionDetails({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex flex-col gap-2 p-2 rounded-md border-1 bg-secondary ">
      <div className="px-2 rounded-md space-y-1">
        <p className="text-sm font-medium">Transaction Details</p>

        <p className="text-sm">
          <span className="font-medium">Amount:</span>{" "}
          <span
            className={`font-semibold ${
              transaction.amount < 0 ? "text-money-out" : "text-money-in"
            }`}
          >
            {formatCurrency(transaction.amount)}
          </span>
        </p>
        <p className="text-sm">
          <span className="font-medium">{transaction.amount > 0 ? "Sender" : "Receiver"}:</span>{" "}
          {transaction.account || "Unknown"}
        </p>
        <p className="text-sm">
          <span className="font-medium">Date:</span> {new Date(transaction.date).toLocaleString()}
        </p>
        <p className="text-sm">
          <span className="font-medium">Description:</span> {transaction.code}{" "}
          {transaction.description}
        </p>
      </div>
    </div>
  );
}

function MultipleTransactionDetails({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="flex flex-col gap-2 p-2 rounded-md border-1 bg-secondary">
      <div className="px-2 rounded-md space-y-2 py-1">
        <div className="text-sm">
          <span>{transactions[0]?.account || "N/A"}</span>
        </div>
      </div>
    </div>
  );
}

interface CategoryModalProps {
  isOpen: boolean;
  mode?: "single" | "multiple";
  onClose: () => void;
  transaction: Transaction;
  transactions?: Transaction[];
}

function CategorizeModal({ isOpen, mode, onClose, transaction, transactions }: CategoryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const combinedCategories = useCategoriesStore((state) => state.categoriesWithSubcategories);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const { categorizeTransaction } = useWriteTransactions();

  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory("");
      setSelectedSubcategory("");
      return;
    }
    const { category, subcategory } = deconstructTrCategory(transaction.category);
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
  }, [transaction?.category, isOpen]);

  useEffect(() => {
    if (
      !selectedCategory ||
      !selectedSubcategory ||
      transaction.category === formatTrCategory(selectedCategory, selectedSubcategory)
    ) {
      return;
    }

    // Update the transaction's category optimistically
    const newCategory = formatTrCategory(selectedCategory, selectedSubcategory);
    Object.assign(transaction, { category: newCategory });

    // Write to database
    categorizeTransaction(transaction.id, formatTrCategory(selectedCategory, selectedSubcategory));
  }, [categorizeTransaction, selectedCategory, selectedSubcategory, transaction]);

  useEffect(() => {
    if (selectedCategory) {
      const categoryData = combinedCategories.find((c) => c.name === selectedCategory);
      const subCategories = categoryData ? categoryData.subcategories.map((s) => s.name) : [];
      setSubcategories(subCategories);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategory, combinedCategories]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setSelectedSubcategory(""); // Reset subcategory when category changes
  };

  if (!transaction) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg pb-12" aria-describedby="category-modal-description">
        <DialogHeader>
          <DialogTitle>
            {mode === "single" ? "Categorize Transaction" : "Categorize Transactions"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mode === "multiple" ? (
            <MultipleTransactionDetails transactions={transactions || [transaction]} />
          ) : (
            <TransactionDetails transaction={transaction} />
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Category dropdown */}
            <SelectionDropdown
              title="Category"
              placeholder="Select or create..."
              options={combinedCategories.map((category) => category.name)}
              value={selectedCategory}
              onChange={handleCategoryChange}
            />

            {/* Subcategory dropdown */}
            <SelectionDropdown
              title="Subcategory"
              placeholder="Select or type..."
              options={subcategories}
              value={selectedSubcategory}
              onChange={setSelectedSubcategory}
              disabled={!selectedCategory || selectedCategory === UNCATEGORIZED}
            />
          </div>
        </div>

        <SimilarTransactionsAccordion
          mode={mode}
          newCategory={formatTrCategory(selectedCategory, selectedSubcategory)}
          selectedTransaction={transaction}
        />
      </DialogContent>
    </Dialog>
  );
}

export default CategorizeModal;
