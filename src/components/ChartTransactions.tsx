import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ArrowUpDown,
  Banknote,
  ArrowUp,
  ArrowDown,
  MousePointerClick,
} from "lucide-react";
import { formatDate } from "date-fns";
import { Transaction } from "@/types/Transaction";
import { formatCurrency, sortBy } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import IconButton from "./IconButton";
import NoData from "./NoData";

function ChartTransactions({
  selected,
  defaultDisplayMode = "all",
  defaultSortBy = "date",
  defaultSortDirection = "asc",
  showDisplayMode = true,
}: {
  selected?: {
    title: string;
    transactions: Transaction[];
  };
  defaultDisplayMode?: "all" | "moneyIn" | "moneyOut";
  defaultSortBy?: "amount" | "date";
  defaultSortDirection?: "asc" | "desc";
  showDisplayMode?: boolean;
}) {
  const [sortByField, setSortByField] = useState<"amount" | "date">(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [display, setDisplayMode] = useState<"all" | "moneyIn" | "moneyOut">("all");

  useEffect(() => {
    setSortByField(defaultSortBy);
    setDisplayMode(defaultDisplayMode);
    setSortDirection(defaultSortDirection);
  }, [defaultSortBy, defaultDisplayMode, defaultSortDirection]);

  const sortedTransactions = useMemo(() => {
    const filteredTransactions = (selected?.transactions || []).filter((transaction) => {
      if (showDisplayMode === false) return true;
      if (display === "all") return true;
      if (display === "moneyIn") return transaction.amount > 0;
      if (display === "moneyOut") return transaction.amount < 0;
      return true;
    });

    return sortBy(filteredTransactions, sortByField as keyof Transaction, sortDirection);
  }, [selected?.transactions, sortByField, sortDirection, showDisplayMode, display]);

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
    <Card className="w-full mx-auto !gap-0 pb-0">
      <CardHeader className="!pb-2 shadow-xs px-3">
        <div className="flex flex-row items-center truncate justify-between space-y-0">
          <div className="text-md font-medium truncate text-ellipsis">
            {selected?.title ? `"${selected?.title}" Transactions` : "Chart Transactions"}
          </div>
        </div>
        <div className="flex flex-row items-center justify-between space-y-0">
          <div className="flex gap-2 items-center">
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
          {showDisplayMode && (
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
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-2">
        {sortedTransactions.length ? (
          <ScrollArea className="h-80">
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
                      <p className="font-medium text-[12px]">{transaction.account}</p>
                      <Badge
                        variant="outline"
                        className="text-primary bg-primary/10 text-nowrap text-xs truncate"
                      >
                        {transaction.category}
                      </Badge>
                      <p className="text-xs text-gray-500">{formattedDate}</p>
                    </div>
                    <p
                      className={`font-medium text-[13px] ${
                        isPositive ? "text-money-in" : "text-money-out"
                      }`}
                    >
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        ) : (
          <NoData text="Click an item on the chart to view transactions" Icon={MousePointerClick} />
        )}
      </CardContent>
    </Card>
  );
}

export default ChartTransactions;
