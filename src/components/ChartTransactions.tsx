import { useEffect, useMemo, useState } from "react";
import { Transaction } from "@/types/Transaction";
import { formatCurrency, sortBy } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ArrowUpDown,
  Banknote,
  ArrowUp,
  ArrowDown,
  MousePointerClick,
} from "lucide-react";
import { formatDate } from "date-fns";
import { ScrollArea } from "./ui/scroll-area";

const ChartTransactions = ({
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
}) => {
  const [sortByField, setSortByField] = useState<"amount" | "date">(
    defaultSortBy
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [display, setDisplayMode] = useState<"all" | "moneyIn" | "moneyOut">(
    "all"
  );

  useEffect(() => {
    setSortByField(defaultSortBy);
    setDisplayMode(defaultDisplayMode);
    setSortDirection(defaultSortDirection);
  }, [defaultSortBy, defaultDisplayMode, defaultSortDirection]);

  const sortedTransactions = useMemo(() => {
    const filteredTransactions = (selected?.transactions || []).filter(
      (transaction) => {
        if (showDisplayMode === false) return true;
        if (display === "all") return true;
        if (display === "moneyIn") return transaction.amount > 0;
        if (display === "moneyOut") return transaction.amount < 0;
        return true;
      }
    );

    return sortBy(
      filteredTransactions,
      sortByField as keyof Transaction,
      sortDirection
    );
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
        <div className="flex flex-row items-center justify-between space-y-0">
          <div className="text-sm font-medium">
            {selected?.title
              ? `"${selected?.title}" Transactions`
              : "Chart Transactions"}
          </div>
          {showDisplayMode && <div className="flex space-x-2">
            <div
              className={`p-1 rounded cursor-pointer ${
                display === "all" ? "bg-green-100" : ""
              }`}
              onClick={() => toggleDisplayMode("all")}
            >
              <ArrowUpDown size={16} />
            </div>
            <div
              className={`p-1 rounded cursor-pointer ${
                display === "moneyIn" ? "bg-green-100" : ""
              }`}
              onClick={() => toggleDisplayMode("moneyIn")}
            >
              <ArrowUp size={16} />
            </div>
            <div
              className={`p-1 rounded cursor-pointer ${
                display === "moneyOut" ? "bg-green-100" : ""
              }`}
              onClick={() => toggleDisplayMode("moneyOut")}
            >
              <ArrowDown size={16} />
            </div>
          </div>}
        </div>
        <div className="flex gap-2 items-center">
          <div
            className={`flex items-center cursor-pointer ${
              sortByField === "date" ? "text-green-600" : ""
            }`}
            onClick={() => toggleSort("date")}
          >
            <Calendar size={16} className="mr-1" />
          </div>
          <div
            className={`flex items-center cursor-pointer ${
              sortByField === "amount" ? "text-green-600" : ""
            }`}
            onClick={() => toggleSort("amount")}
          >
            <Banknote size={22} className="mr-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-2">
        {sortedTransactions.length ? (
          <ScrollArea className="h-80">
            {sortedTransactions.map((transaction) => {
              const formattedDate = formatDate(
                transaction.date,
                "EEE, do MMM yyyy HH:mm"
              );
              const isPositive = transaction.amount > 0;

              return (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center row px-2 border-b py-2"
                >
                  <div className="flex justify-between items-center w-full mb-1">
                    <div className=" w-[70%]">
                      <p className="font-medium text-[13px] ">
                        {transaction.account}
                      </p>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 text-nowrap text-xs truncate"
                      >
                        {transaction.category}
                      </Badge>
                      <p className="text-xs text-gray-500">{formattedDate}</p>
                    </div>
                    <p
                      className={`font-medium text-[13px] ${
                        isPositive ? "text-green-600" : "text-red-600"
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
          <div className="flex flex-col space-y-4 h-80 mx-auto opacity-50 pt-8">
            <MousePointerClick size={24} className="text-center mx-auto" />
            <span className="text-center text-sm">
              Click an item on the chart to view transactions under it.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChartTransactions;
