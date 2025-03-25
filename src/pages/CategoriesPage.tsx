import { useCallback, useMemo, useState } from "react";
import TransactionsTable, { SortBy } from "@/components/GroupedTrsTable/Table";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
} from "@/lib/groupByField";
import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import { filterTransactions, sortBy } from "@/lib/utils";
import { TransactionSearch } from "@/components/SearchInput";
import { MoneyMode } from "@/types/Transaction";
import CategoriesChart from "@/components/CategoriesChart";
import { Button } from "@/components/ui/button";
import useSidepanelStore, {
  SidepanelMode,
  SidepanelTransactions,
} from "@/stores/sidepanel.store";
import { useTransactionContext } from "@/context/TransactionDataContext";
import {
  ActionItem,
  TableRowActions,
} from "@/components/GroupedTrsTable/RowAction";
import { Filter } from "@/types/Filters";

const CategoriesPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { transactions, calculatedData, validateAndAddFilters } =
    useTransactionContext();
  const {
    transactionTotals,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
  } = calculatedData;

  const setSidepanel = useSidepanelStore((state) => state.setMode);
  const setSidepanelMode = useSidepanelStore((state) => state.setMode);
  const setTransactionsData = useSidepanelStore(
    (state) => state.setTransactionsData
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

  const actions: ActionItem[] = useMemo(
    () => [
      {
        title: "Show Similar",
        onClick: (row) => {
          const filter: Filter = {
            field: "category",
            operator: "==",
            value: row.name,
            mode: 'and',
          };
          validateAndAddFilters(filter);
        },
      },
      {
        title: "Exclude Similar",
        onClick: (row) => {
          const filter: Filter = {
            field: "category",
            operator: "!=",
            value: row.name,
            mode: 'and',
          };
          validateAndAddFilters(filter);
        },
      },
      {
        title: "View Transactions",
        onClick: (row) => {
          setTransactionsData(row);
          setSidepanelMode(SidepanelMode.Transactions);
        },
      },
    ],
    [validateAndAddFilters, setTransactionsData, setSidepanelMode]
  );

  const columnsWithActions = useMemo(
    () =>
      transactionGroupSummaryColumns({
        title: "Categories",
        filters: (value: string) => [
          {
            field: 'category',
            operator: '==',
            value,
          },
          {
            field: 'category',
            operator: '!=',
            value,
          },
        ],
        rows: [
          {
            headerTitle: "Actions",
            rowElement: (row) => (
              <TableRowActions row={row} actions={actions} />
            ),
          },
        ],
      }),
    [actions]
  );

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
