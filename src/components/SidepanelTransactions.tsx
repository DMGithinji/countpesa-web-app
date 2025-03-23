import { useMemo, useState } from "react";
import { Transaction } from "@/types/Transaction";
import { formatCurrency, sortBy } from "@/lib/utils";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { ScrollArea } from "./ui/scroll-area";
import useSidepanelStore, { SidepanelMode } from "@/stores/sidepanel.store";
import { Button } from "./ui/button";

const SidepanelTransactions = () => {
  const [sortByField, setSortByField] = useState<"amount" | "date">('date');
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [display, setDisplayMode] = useState<"all" | "moneyIn" | "moneyOut">(
    "all"
  );
  const transactionSummary = useSidepanelStore(state => state.transactionsData);
  const setSidepanel = useSidepanelStore(state => state.setMode);

  const sortedTransactions = useMemo(() => {
    if (!transactionSummary?.transactions) return [];
    const filteredTransactions = (transactionSummary?.transactions || []).filter(
      (transaction) => {
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
      <CardHeader className="bg-slate-900 text-white sticky top-0 z-50 pt-2 pb-2 pl-4 pr-0">
        <div className="flex flex-row items-start justify-between space-y-0">
          <div className="text-lg font-medium">
            {transactionSummary?.name ? `${transactionSummary.name} Transactions` :'No Data Selected'}
          </div>
          <Button
            variant={"ghost"}
            onClick={() => setSidepanel(SidepanelMode.Closed)}
            className="hover:bg-transparent hover:text-white mt-[-6px]"
          >
            <X size={16} />
          </Button>

        </div>
        <div className="flex flex-row items-center justify-between space-y-0">
        <div className="flex gap-3 items-center py-1">
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
        {
          !!(transactionSummary?.moneyInTrs?.length &&
          transactionSummary?.moneyOutTrs?.length) &&
          <div className="flex space-x-2">
            <div
              className={`p-1 rounded cursor-pointer ${
                display === "all" ? "text-green-600" : ""
              }`}
              onClick={() => toggleDisplayMode("all")}
            >
              <ArrowUpDown size={16} />
            </div>
            <div
              className={`p-1 rounded cursor-pointer ${
                display === "moneyIn" ? "text-green-600" : ""
              }`}
              onClick={() => toggleDisplayMode("moneyIn")}
            >
              <ArrowUp size={16} />
            </div>
            <div
              className={`p-1 rounded cursor-pointer ${
                display === "moneyOut" ? "text-green-600" : ""
              }`}
              onClick={() => toggleDisplayMode("moneyOut")}
            >
              <ArrowDown size={16} />
            </div>
          </div>
        }
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-2">
        {sortedTransactions.length ? (
          <ScrollArea className="h-[calc(100vh-6rem)] overflow-y-auto mt-0">
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
              No transactions match the selected configuration
            </span>
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default SidepanelTransactions;
