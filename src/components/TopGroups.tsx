import { useState } from "react";
import { GroupByField } from "@/lib/groupByField";
import { Transaction } from "@/types/Transaction";
import useTransactionStore from "@/stores/transactions.store";
import TopTrsGroupedByField from "./TopTrsGroupedByField";
import ChartTransactions from "./ChartTransactions";

const TOP_COUNT = 6;

function TopGroups() {
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
          moneyInSummaryByAmt={topAccountsReceivedFromByAmt.slice(0, TOP_COUNT)}
          moneyOutSummaryByAmt={topAccountsSentToByAmt.slice(0, TOP_COUNT)}
          moneyInSummaryByCount={topAccountsReceivedFromByCount.slice(0, TOP_COUNT)}
          moneyOutSummaryByCount={topAccountsSentToByCount.slice(0, TOP_COUNT)}
          onSelectGroup={setSelectedTransactions}
        />
        <TopTrsGroupedByField
          groupedBy={GroupByField.Category}
          moneyInSummaryByAmt={topCategoriesMoneyInByAmt.slice(0, TOP_COUNT)}
          moneyOutSummaryByAmt={topCategoriesMoneyOutByAmt.slice(0, TOP_COUNT)}
          moneyInSummaryByCount={topCategoriesMoneyInByCount.slice(0, TOP_COUNT)}
          moneyOutSummaryByCount={topCategoriesMoneyOutByCount.slice(0, TOP_COUNT)}
          onSelectGroup={setSelectedTransactions}
        />
      </div>
      <div className="lg:col-span-1 hidden sm:block">
        <ChartTransactions
          selected={selectedTransactions}
          defaultDisplayMode="all"
          defaultSortBy="amount"
          showDisplayMode={false}
        />
      </div>
    </div>
  );
}

export default TopGroups;
