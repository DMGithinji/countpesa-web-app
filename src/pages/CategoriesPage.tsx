import { useCallback, useMemo, useState } from "react";
import TransactionsTable, { SortBy } from "@/components/GroupedTrsTable/Table";
import {
  getGroupByCategoryOrSubcategory,
  GroupByField,
  GroupByTrxSortBy,
  groupTrxByField,
} from "@/lib/groupByField";
import { filterTransactions, sortBy } from "@/lib/utils";
import { TransactionSearch } from "@/components/SearchInput";
import { MoneyMode } from "@/types/Transaction";
import CategoriesChart from "@/components/CategoriesChart";
import { Button } from "@/components/ui/button";
import useSidepanelStore, { SidepanelMode, SidepanelTransactions } from "@/stores/ui.store";
import { useTableActions } from "@/hooks/useTableActions";
import { useTransactionColumns } from "@/hooks/useTransactionColumns";
import useTransactionStore from "@/stores/transactions.store";

function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const transactions = useTransactionStore((state) => state.transactions);
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const validateAndAddFilters = useTransactionStore((state) => state.validateAndAddFilters);
  const { transactionTotals, topCategoriesMoneyInByAmt, topCategoriesMoneyOutByAmt } =
    calculatedData;

  const setSidepanel = useSidepanelStore((state) => state.setSidepanelMode);
  const setSidepanelMode = useSidepanelStore((state) => state.setSidepanelMode);
  const setTransactionsData = useSidepanelStore((state) => state.setSidepanelTransactions);
  const [sortingState, setSortingState] = useState<SortBy>({
    desc: false,
    id: GroupByTrxSortBy.MoneyOut,
  });

  const groupedTrs = useMemo(() => {
    const filteredTrs = filterTransactions(transactions, searchQuery);
    let groupedTrx = groupTrxByField(filteredTrs, GroupByField.Category);

    if (groupedTrx.length === 1) {
      groupedTrx = groupTrxByField(groupedTrx[0].transactions, GroupByField.Subcategory);
    }

    return sortBy(groupedTrx, sortingState.id, sortingState.desc ? "desc" : "asc");
  }, [searchQuery, sortingState, transactions]);

  /** When focused on a category, show the subcategories */
  const { title, groupByField, moneyOutGroups, moneyInGroups } = useMemo(
    () => getGroupByCategoryOrSubcategory(topCategoriesMoneyInByAmt, topCategoriesMoneyOutByAmt),
    [topCategoriesMoneyInByAmt, topCategoriesMoneyOutByAmt]
  );

  const handlePieChartClick = useCallback(
    (summary: SidepanelTransactions) => {
      setTransactionsData(summary);
      setSidepanelMode(SidepanelMode.Transactions);
    },
    [setSidepanelMode, setTransactionsData]
  );

  const actions = useTableActions({
    groupByField,
    validateAndAddFilters,
    setTransactionsData,
    setSidepanelMode,
  });

  const columnsWithActions = useTransactionColumns({
    groupByField,
    actions,
    title,
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <CategoriesChart
          moneyMode={MoneyMode.MoneyIn}
          totalAmount={transactionTotals.moneyInAmount}
          groupedDataByAmount={moneyInGroups}
          onItemClick={handlePieChartClick}
        />
        <CategoriesChart
          moneyMode={MoneyMode.MoneyOut}
          totalAmount={transactionTotals.moneyOutAmount}
          groupedDataByAmount={moneyOutGroups}
          onItemClick={handlePieChartClick}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <TransactionSearch onSearch={setSearchQuery} />
          <Button
            variant="outline"
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
}

export default CategoriesPage;
