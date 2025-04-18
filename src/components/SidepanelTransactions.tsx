import { useMemo, useState } from "react";
import {
  Calendar,
  ArrowUpDown,
  Banknote,
  ArrowUp,
  ArrowDown,
  MousePointerClick,
  X,
} from "lucide-react";
import { formatDate } from "date-fns";
import { Transaction } from "@/types/Transaction";
import { formatCurrency, sortBy } from "@/lib/utils";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import useSidepanelStore, { SidepanelMode } from "@/stores/ui.store";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import IconButton from "./IconButton";

function SidepanelTransactions() {
  const [sortByField, setSortByField] = useState<"amount" | "date">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [display, setDisplayMode] = useState<"all" | "moneyIn" | "moneyOut">("all");
  const transactionSummary = useSidepanelStore((state) => state.sidepanelTransactions);
  const setSidepanelMode = useSidepanelStore((state) => state.setSidepanelMode);

  const sortedTransactions = useMemo(() => {
    if (!transactionSummary?.transactions) return [];
    const filteredTransactions = (transactionSummary?.transactions || []).filter((transaction) => {
      if (display === "all") return true;
      if (display === "moneyIn") return transaction.amount > 0;
      if (display === "moneyOut") return transaction.amount < 0;
      return true;
    });

    return sortBy(filteredTransactions, sortByField as keyof Transaction, sortDirection);
  }, [transactionSummary?.transactions, sortByField, sortDirection, display]);

  const toggleSort = (type: "amount" | "date") => {
    if (sortByField === type) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortByField(type);
      setSortDirection("asc");
    }
  };

  const toggleDisplayMode = (mode: "all" | "moneyIn" | "moneyOut") => {
    setDisplayMode(mode);
  };

  return (
    <div>
      <CardHeader className="bg-[#222] text-white sticky top-0 z-50 pt-2 pb-2 pl-4 pr-0">
        <div className="flex flex-row items-start justify-between space-y-0">
          <div className="text-base font-medium">
            {transactionSummary?.name
              ? `"${transactionSummary.name}" Transactions`
              : "No Data Selected"}
          </div>
          <Button
            variant="ghost"
            onClick={() => setSidepanelMode(SidepanelMode.Closed)}
            className="hover:bg-transparent hover:text-white mt-[-6px]"
          >
            <X size={16} />
          </Button>
        </div>
        <div className="flex flex-row items-center justify-between space-y-0">
          <div className="flex gap-3 items-center py-1">
            <IconButton
              isActive={sortByField === "date"}
              onClick={() => toggleSort("date")}
              Icon={Calendar}
            />
            <IconButton
              isActive={sortByField === "amount"}
              onClick={() => toggleSort("amount")}
              Icon={Banknote}
              size={18}
            />
          </div>
          <div className="flex space-x-2">
            <IconButton
              isActive={display === "all"}
              onClick={() => toggleDisplayMode("all")}
              Icon={ArrowUpDown}
            />
            <IconButton
              isActive={display === "moneyIn"}
              onClick={() => toggleDisplayMode("moneyIn")}
              Icon={ArrowUp}
            />
            <IconButton
              isActive={display === "moneyOut"}
              onClick={() => toggleDisplayMode("moneyOut")}
              Icon={ArrowDown}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-2">
        {sortedTransactions.length ? (
          <ScrollArea className="h-[calc(100vh-6rem)] overflow-y-auto mt-0">
            {sortedTransactions.map((transaction) => {
              const formattedDate = formatDate(transaction.date, "EEE, do MMM yyyy HH:mm");
              const isPositive = transaction.amount > 0;

              return (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center row px-2 border-b py-2"
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <div className=" w-[70%]">
                      <p className="font-medium text-[13px] ">{transaction.account}</p>
                      <Badge
                        variant="outline"
                        className="text-primary bg-primary/10 text-nowrap text-xs truncate"
                      >
                        {transaction.category}
                      </Badge>
                      <p className="text-xs text-gray-500">{formattedDate}</p>
                    </div>
                    <p
                      className={`font-medium text-[13px] ${isPositive ? "text-money-in" : "text-money-out"}`}
                    >
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        ) : (
          <div className="flex flex-col space-y-4 h-80 mx-auto opacity-50 pt-8">
            <MousePointerClick size={24} className="text-center mx-auto" />
            <span className="text-center text-sm">
              No transactions match the selected configuration
            </span>
          </div>
        )}
      </CardContent>
    </div>
  );
}

export default SidepanelTransactions;
