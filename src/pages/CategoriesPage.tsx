import { useCallback, useMemo, useState } from "react";
import TransactionsTable, { SortBy } from "@/components/GroupedTrsTable/Table";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
} from "@/lib/groupByField";
import { filterTransactions, sortBy } from "@/lib/utils";
import { TransactionSearch } from "@/components/SearchInput";
import { MoneyMode } from "@/types/Transaction";
import CategoriesChart from "@/components/CategoriesChart";
import { Button } from "@/components/ui/button";
import useSidepanelStore, {
  SidepanelMode,
  SidepanelTransactions,
} from "@/stores/ui.store";
import { useTransactionContext } from "@/context/TransactionDataContext";
import { useTransactionActions } from "@/hooks/useTransactionActions";
import { useTransactionColumns } from "@/hooks/useTransactionColumns";

const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { transactions, calculatedData, validateAndAddFilters } =
    useTransactionContext();
  const {
    transactionTotals,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
  } = calculatedData;

  const setSidepanel = useSidepanelStore((state) => state.setSidepanelMode);
  const setSidepanelMode = useSidepanelStore((state) => state.setSidepanelMode);
  const setTransactionsData = useSidepanelStore(
    (state) => state.setSidepanelTransactions
  );
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

  const handlePieChartClick = useCallback(
    (summary: SidepanelTransactions) => {
      setTransactionsData(summary);
      setSidepanelMode(SidepanelMode.Transactions);
    },
    [setSidepanelMode, setTransactionsData]
  );

  const actions = useTransactionActions({
    groupByField: GroupByField.Category,
    validateAndAddFilters,
    setTransactionsData,
    setSidepanelMode,
  });

  const columnsWithActions = useTransactionColumns({
    groupByField: GroupByField.Category,
    actions,
    title: "Categories",
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <CategoriesChart
          title="Money In"
          moneyMode={MoneyMode.MoneyIn}
          totalAmount={transactionTotals.moneyInAmount}
          groupedDataByAmount={topCategoriesMoneyInByAmt}
          onItemClick={handlePieChartClick}
        />
        <CategoriesChart
          title="Money Out"
          moneyMode={MoneyMode.MoneyOut}
          totalAmount={transactionTotals.moneyOutAmount}
          groupedDataByAmount={topCategoriesMoneyOutByAmt}
          onItemClick={handlePieChartClick}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <TransactionSearch onSearch={setSearchQuery} />
          <Button
            variant={"outline"}
            className="cursor-pointer"
            onClick={() => setSidepanel(SidepanelMode.Categories)}
          >
            Manage Categories
          </Button>
        </div>
        <TransactionsTable
          transactions={groupedTrs}
          columnDef={columnsWithActions}
          onSortingChange={setSortingState}
          sortBy={sortingState}
        />
      </div>
    </div>
  );
};

export default CategoriesPage;
