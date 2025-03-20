import { useMemo, useState } from "react";
import TransactionsTable, { SortBy } from "@/components/GroupedTrsTable/Table";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
} from "@/lib/groupByField";
import useTransactionStore from "@/stores/transactions.store";
import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import { filterTransactions, sortBy } from "@/lib/utils";
import { TransactionSearch } from "@/components/SearchInput";
import { useCalculate } from "@/hooks/useCalculate";
import { MoneyMode } from "@/types/Transaction";
import CategoriesChart from "@/components/CategoriesChart";
import { Button } from "@/components/ui/button";
import useSidepanelStore from "@/stores/sidepanel.store";

const CategoriesPage = () => {
  const setSidepanelOpen = useSidepanelStore(state => state.setSidepanelOpen)
  const transactions = useTransactionStore((state) => state.transactions);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    transactionTotals,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
  } = useCalculate();

  const columnDefProps = { title: "Categories" };
  const columnDef = transactionGroupSummaryColumns(columnDefProps);
  const [sortingState, setSortingState] = useState<SortBy>({
    desc: false,
    id: GroupByTrxSortBy.MoneyOut,
  });

  const groupedTrs = useMemo(() => {
    const filteredTrs = filterTransactions(transactions, searchQuery);
    const groupedTrx = groupedTrxByField(filteredTrs, GroupByField.Category);
    return sortBy(
      groupedTrx,
      sortingState.id,
      sortingState.desc ? "desc" : "asc"
    );
  }, [searchQuery, sortingState, transactions]);

  return (
    <div className="container mx-auto max-w-5xl flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <CategoriesChart
          title="Money In"
          moneyMode={MoneyMode.MoneyIn}
          totalAmount={transactionTotals.moneyInAmount}
          groupedDataByAmount={topCategoriesMoneyInByAmt.map((t) => ({
            name: t.name,
            amount: t.amount,
            count: t.count,
            percentage: t.amountPercentage,
          }))}
        />
        <CategoriesChart
          title="Money Out"
          moneyMode={MoneyMode.MoneyOut}
          totalAmount={transactionTotals.moneyOutAmount}
          groupedDataByAmount={topCategoriesMoneyOutByAmt.map((t) => ({
            name: t.name,
            amount: t.amount,
            count: t.count,
            percentage: t.amountPercentage,
          }))}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <TransactionSearch onSearch={setSearchQuery} />
          <Button variant={'outline'} className="cursor-pointer" onClick={() => setSidepanelOpen(true)}>
            Manage Categories
          </Button>
        </div>
        <TransactionsTable
          transactions={groupedTrs}
          columnDef={columnDef}
          onSortingChange={setSortingState}
          sortBy={sortingState}
        />
      </div>
    </div>
  );
};

export default CategoriesPage;
