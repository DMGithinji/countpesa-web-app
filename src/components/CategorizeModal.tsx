import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Transaction } from "@/types/Transaction";
import SelectionDropdown from "./SelectionDropDown";
import useCategoriesStore from "@/stores/categories.store";
import { UNCATEGORIZED } from "@/types/Categories";
import {
  deconstructTrCategory,
  formatTrCategory,
} from "@/hooks/useTransactions";
import SimilarTransactionsAccordion from "./SimilarTransactionsAccordion";
import { useTransactionContext } from "@/context/TransactionDataContext";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

const CategorizeModal = ({
  isOpen,
  onClose,
  transaction,
}: CategoryModalProps) => {
  const [category, setCategory] = useState<string>("");
  const [subcategory, setSubcategory] = useState<string>("");
  const combinedCategories = useCategoriesStore(
    (state) => state.categoriesWithSubcategories
  );
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const { categorizeTransaction } = useTransactionContext();

  useEffect(() => {
    if (!isOpen) {
      setCategory("");
      setSubcategory("");
      return;
    }
    const { category, subcategory } = deconstructTrCategory(
      transaction.category
    );
    setCategory(category);
    setSubcategory(subcategory);
  }, [transaction?.category, isOpen]);

  useEffect(() => {
    if (
      !category ||
      !subcategory ||
      transaction.category === formatTrCategory(category, subcategory)
    ) {
      return;
    }

    transaction.category = formatTrCategory(category, subcategory);
    categorizeTransaction(
      transaction.id,
      formatTrCategory(category, subcategory)
    );
  }, [categorizeTransaction, category, subcategory, transaction]);

  useEffect(() => {
    if (category) {
      const categoryData = combinedCategories.find((c) => c.name === category);
      const subCategories = categoryData
        ? categoryData.subcategories.map((s) => s.name)
        : [];
      setSubcategories(subCategories);
    } else {
      setSubcategories([]);
    }
  }, [category, combinedCategories]);

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory(""); // Reset subcategory when category changes
  };

  if (!transaction) {
    return null;
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg pb-12"
        aria-describedby="category-modal-description"
      >
        <DialogHeader>
          <DialogTitle>Categorize Transaction</DialogTitle>
        </DialogHeader>

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
              disabled={!category || category === UNCATEGORIZED}
            />
          </div>
        </div>

          <SimilarTransactionsAccordion
            newCategory={formatTrCategory(category, subcategory)}
            selectedTransaction={transaction}
          />
      </DialogContent>
    </Dialog>
  );
};

export default CategorizeModal;

const TransactionDetails = ({ transaction }: { transaction: Transaction }) => (
  <div className="flex flex-col gap-2 p-2 rounded-md border-1 bg-gray-50 ">
    <p className="text-sm font-medium px-2">Transaction Details:</p>
    <div className="px-2 rounded-md">
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
