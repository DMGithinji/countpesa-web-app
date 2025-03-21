import { useState, useEffect } from "react";
import { Transaction } from "@/types/Transaction";
import { formatDate } from "date-fns";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { useTransactions } from "@/hooks/useTransactions";
import { Checkbox } from "./ui/checkbox";

interface SimilarTransactionsAccordionProps {
  selectedTransaction: Transaction;
  newCategory: string;
}

const SimilarTransactionsAccordion = ({
  selectedTransaction,
  newCategory,
}: SimilarTransactionsAccordionProps) => {
  const [similarTransactions, setSimilarTransactions] = useState<Transaction[]>(
    []
  );

  const [isOpen, setIsOpen] = useState(false);

  const { getRelatedTransactions, bulkUpdateTransactions } =
    useTransactions();

  useEffect(() => {
    getRelatedTransactions(selectedTransaction.account).then((trs => {
      const filtered = trs.filter((tx) => tx.id !== selectedTransaction.id);
      setSimilarTransactions(filtered);
    }));
  }, [getRelatedTransactions, selectedTransaction]);

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
            <div className="flex items-start gap-2">
              <Checkbox className="mt-[4px] border-2 cursor-pointer" onClick={(e) => {
                categorizeTransactions();
                e.stopPropagation();
              } } />
              <span className="text-green-600 font-xs">
                Sync category for {similarTransactions.length} similar uncategorized transactions.
              </span>
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
          <div className="divide-y px-4 pt-2 max-h-64 overflow-y-auto">
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
