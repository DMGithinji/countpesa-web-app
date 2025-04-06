import { useState, useEffect, useMemo } from "react";
import { Transaction } from "@/types/Transaction";
import { formatDate } from "date-fns";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { UNCATEGORIZED } from "@/types/Categories";
import { useTransactions } from "@/hooks/useTransactions";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface SimilarTransactionsAccordionProps {
  selectedTransaction: Transaction;
  newCategory: string;
  mode?: "single" | "multiple";
}

const SimilarTransactionsAccordion = ({
  selectedTransaction,
  newCategory,
  mode = "single",
}: SimilarTransactionsAccordionProps) => {
  const [similarTransactions, setSimilarTransactions] = useState<Transaction[]>(
    []
  );

  const [isOpen, setIsOpen] = useState(false);

  const { getRelatedTransactions, bulkUpdateTransactions } = useTransactions();

  const isSame = useMemo(() => {
    return similarTransactions.every((tr) => tr.category === newCategory);
  }, [similarTransactions, newCategory]);

  useEffect(() => {
    const getAll = mode === "multiple";
    getRelatedTransactions(
      selectedTransaction.account,
      selectedTransaction.category,
      getAll
    ).then((trs) => {
      const filtered = trs.filter(
        (tx) => mode === "multiple" || tx.id !== selectedTransaction.id
      );
      setSimilarTransactions(filtered);
    });
  }, [getRelatedTransactions, mode, selectedTransaction]);

  const categorizeTransactions = async () => {
    const updated = similarTransactions.map((tx) => ({
      ...tx,
      category: newCategory,
    }));
    setSimilarTransactions(updated);
    await bulkUpdateTransactions(updated);
  };

  if (!similarTransactions.length) return null;

  return (
    <div className="border rounded-md w-full mt-4">
      <div className="flex flex-col">
        <div
          className="flex gap-2 items-center justify-between p-2 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 px-2">
            <div className="flex items-center gap-3">
              {newCategory !== UNCATEGORIZED && (
                <Checkbox
                  checked={isSame}
                  className="border-2 border-foreground cursor-pointer"
                  onClick={(e) => {
                    categorizeTransactions();
                    e.stopPropagation();
                  }}
                />
              )}
              {mode === "multiple" ? (
                <span className="font-sm text-sm px-2">
                  {newCategory === UNCATEGORIZED
                    ? `${similarTransactions.length} Transactions Found`
                    : `Apply To All (${similarTransactions.length} Transactions)`}
                </span>
              ) : (
                <span className="text-money-in font-xs text-sm">
                  {newCategory !== UNCATEGORIZED
                    ? `Match this category for ${similarTransactions.length} similar/uncategorized transactions.`
                    : `${similarTransactions.length} similar transactions found.`}
                </span>
              )}
            </div>
          </div>
          <div className="pr-2">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>

        {isOpen && (
          <div className="px-4 pt-2 max-h-64 overflow-y-auto">
            <Separator />
            {similarTransactions.map((tx) => (
              <div key={tx.id} className="px-2 py-3 hover:bg-secondary">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-sm">{tx.account}</p>
                      {tx.category && (
                        <Badge
                          variant="outline"
                          className="text-primary bg-primary/10 text-nowrap text-xs truncate"
                        >
                          {tx.category}
                        </Badge>
                      )}
                      <p className="text-sm">
                        {formatDate(new Date(tx.date), "EEE MMM dd yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-right text-sm",
                      tx.amount < 0 ? "text-money-out" : "text-money-in"
                    )}
                  >
                    <p className="font-medium">
                      {tx.amount < 0 ? "-" : ""}
                      {formatCurrency(Math.abs(tx.amount))}
                    </p>
                    <p className="text-xs">Amount</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimilarTransactionsAccordion;
