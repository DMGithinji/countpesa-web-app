import { useState, useEffect, useMemo } from "react";
import { Transaction } from "@/types/Transaction";
import { formatDate } from "date-fns";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Checkbox } from "./ui/checkbox";
import { UNCATEGORIZED } from "@/types/Categories";
import { useTransactionContext } from "@/context/TransactionDataContext";

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

  const { getRelatedTransactions, bulkUpdateTransactions } =
    useTransactionContext();

  const isSame = useMemo(() => {
    return  similarTransactions.every(tr => tr.category === newCategory)
  }, [similarTransactions, newCategory])

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
          className="flex gap-2 items-center justify-between p-2 cursor-pointer bg-slate-50 hover:bg-slate-100"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-start gap-3">
              {newCategory !== UNCATEGORIZED && (
                <Checkbox
                  checked={isSame}
                  className="mt-[2px] border-2 cursor-pointer"
                  onClick={(e) => {
                    categorizeTransactions();
                    e.stopPropagation();
                  }}
                />
              )}
              {mode === "multiple" ? (
                <span className="font-sm text-sm px-2">
                  {newCategory === UNCATEGORIZED  ? `${similarTransactions.length} Transactions Found` : `Apply To All (${similarTransactions.length} Transactions)`}
                </span>
              ) : (
                <span className="text-green-600 font-xs text-sm">
                  {newCategory !== UNCATEGORIZED
                    ? `Match this category for ${similarTransactions.length} similar/uncategorized transactions.`
                    : `${similarTransactions.length} similar transactions found.`}
                </span>
              )}
            </div>
          </div>
          <div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            )}
          </div>
        </div>

        {isOpen && (
          <div className="px-4 pt-2 max-h-64 overflow-y-auto">
            {similarTransactions.map((tx) => (
              <div key={tx.id} className="px-2 py-3 hover:bg-slate-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium text-sm">{tx.account}</p>
                      {tx.category && (
                        <div className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-sm inline-block">
                          {tx.category}
                        </div>
                      )}
                      <p className="text-sm text-slate-500">
                        {formatDate(new Date(tx.date), "EEE MMM dd yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "text-right text-sm",
                      tx.amount < 0 ? "text-red-600" : "text-green-600"
                    )}
                  >
                    <p className="font-medium">
                      {tx.amount < 0 ? "-" : ""}
                      {formatCurrency(Math.abs(tx.amount))}
                    </p>
                    <p className="text-xs text-slate-500">Amount</p>
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
