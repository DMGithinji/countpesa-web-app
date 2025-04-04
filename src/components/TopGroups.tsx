import { useState } from "react";
import { GroupByField } from "@/lib/groupByField";
import { Transaction } from "@/types/Transaction";
import TopTrsGroupedByField from "./TopTrsGroupedByField";
import ChartTransactions from "./ChartTransactions";
import useTransactionStore from "@/stores/transactions.store";

const TopGroups = () => {
  const [selectedTransactions, setSelectedTransactions] = useState<{
    title: string;
    transactions: Transaction[];
  }>({
    title: "",
    transactions: [],
  });
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const {
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
    topAccountsSentToByCount,
    topAccountsReceivedFromByCount,
    topCategoriesMoneyInByCount,
    topCategoriesMoneyOutByCount,
  } = calculatedData;

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-4">
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <TopTrsGroupedByField
          groupedBy={GroupByField.Account}
          moneyInSummaryByAmt={topAccountsReceivedFromByAmt.slice(0, 5)}
          moneyOutSummaryByAmt={topAccountsSentToByAmt.slice(0, 5)}
          moneyInSummaryByCount={topAccountsReceivedFromByCount.slice(0, 5)}
          moneyOutSummaryByCount={topAccountsSentToByCount.slice(0, 5)}
          onSelectGroup={setSelectedTransactions}
        />
        <TopTrsGroupedByField
          groupedBy={GroupByField.Category}
          moneyInSummaryByAmt={topCategoriesMoneyInByAmt.slice(0, 5)}
          moneyOutSummaryByAmt={topCategoriesMoneyOutByAmt.slice(0, 5)}
          moneyInSummaryByCount={topCategoriesMoneyInByCount.slice(0, 5)}
          moneyOutSummaryByCount={topCategoriesMoneyOutByCount.slice(0, 5)}
          onSelectGroup={setSelectedTransactions}
        />
      </div>
      <div className="lg:col-span-1">
        <ChartTransactions
          selected={selectedTransactions}
          defaultDisplayMode={"all"}
          defaultSortBy="amount"
          showDisplayMode={false}
        />
      </div>
    </div>
  );
};

export default TopGroups;
