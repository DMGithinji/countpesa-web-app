import { useMemo, useState } from "react";
import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TransactionSearch } from "@/components/SearchInput";
import AmtSummaryCard2 from "@/components/AmtSummaryCard2";
import TransactionsTable, { SortBy } from "@/components/TransactionsTable/Table";
import GroupedTransactionsTable, {
  SortBy as GroupedSortBy,
} from "@/components/GroupedTrsTable/Table";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { TransactionSummary } from "@/lib/groupByField";
import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import { filterTransactions, sortBy } from "@/lib/utils";
import { MoneyMode, Transaction } from "@/types/Transaction";
import useTransactionStore from "@/stores/transactions.store";

function TransactionTable({
  transactions,
  groupBy,
  pageIndex,
  setPageIndex,
  sortingState,
  onSortingChange,
  groupedSortingState,
  setGroupedSortingState,
}: {
  transactions: Transaction[];
  groupBy: "all" | Period;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  sortingState: SortBy;
  onSortingChange: (sortDir: SortBy) => void;
  groupedSortingState: GroupedSortBy;
  setGroupedSortingState: (sortByField: GroupedSortBy) => void;
}) {
  switch (groupBy) {
    case "all":
      return (
        <TransactionsTable
          transactions={transactions}
          sortBy={sortingState}
          onSortingChange={onSortingChange}
          pageIndex={pageIndex}
          onPageChange={setPageIndex}
        />
      );
    case Period.DATE:
    case Period.WEEK:
    case Period.MONTH:
    case Period.YEAR: {
      const columnDefProps = {
        title: groupBy.slice(0, 1).toUpperCase() + groupBy.slice(1),
      };
      const columnDef = transactionGroupSummaryColumns(columnDefProps);
      const grouped = groupTransactionsByPeriod(transactions, groupBy);
      const summary: TransactionSummary[] = Object.keys(grouped).map((key) => {
        const trs = grouped[key];
        const trsTotals = calculateTransactionTotals(trs);
        return {
          name: key,
          transactions: trs,
          ...trsTotals,
        };
      });

      return (
        <GroupedTransactionsTable
          transactions={summary}
          columnDef={columnDef}
          sortBy={groupedSortingState}
          onSortingChange={setGroupedSortingState}
        />
      );
    }
    default:
      return null;
  }
}

type PeriodOption = Period | "all";

function TransactionsPage() {
  const transactions = useTransactionStore((state) => state.transactions);
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const dateRangeData = useTransactionStore((state) => state.dateRangeData);
  const periodAverages = useTransactionStore((state) => state.periodAverages);
  const { defaultPeriod, periodOptions } = dateRangeData;
  const { transactionTotals } = calculatedData;

  const [groupBy, setGroupBy] = useState<PeriodOption>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageIndex, setPageIndex] = useState(0);
  const [sortingState, setSortingState] = useState<SortBy>({
    desc: true,
    id: "date",
  });
  const [groupedSortingState, setGroupedSortingState] = useState<GroupedSortBy>({
    desc: true,
    id: "name",
  });

  const filteredTrs = useMemo(() => {
    const filtered = filterTransactions(transactions, searchQuery);
    const sorted = sortBy(filtered, sortingState.id, sortingState.desc ? "desc" : "asc");
    return sorted;
  }, [searchQuery, transactions, sortingState]);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <AmtSummaryCard2
          type="Received"
          count={transactionTotals.moneyInCount}
          amount={transactionTotals.moneyInAmount}
          mode={MoneyMode.MoneyIn}
          transactions={transactionTotals.moneyInTrs}
          periodOptions={periodOptions}
          defaultPeriod={defaultPeriod}
          periodAverages={periodAverages}
        />
        <AmtSummaryCard2
          type="Sent"
          count={transactionTotals.moneyOutCount}
          amount={transactionTotals.moneyOutAmount}
          mode={MoneyMode.MoneyOut}
          transactions={transactionTotals.moneyOutTrs}
          periodOptions={periodOptions}
          defaultPeriod={defaultPeriod}
          periodAverages={periodAverages}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <TransactionSearch onSearch={setSearchQuery} />
          <ToggleGroup type="single" value={groupBy}>
            {["all", ...periodOptions].map((grouping) => (
              <ToggleGroupItem
                className="cursor-pointer px-4 capitalize"
                onClick={() => setGroupBy(grouping as Period)}
                value={grouping}
                key={grouping}
              >
                {grouping}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <TransactionTable
          transactions={filteredTrs}
          groupBy={groupBy}
          pageIndex={pageIndex}
          setPageIndex={setPageIndex}
          sortingState={sortingState}
          onSortingChange={setSortingState}
          groupedSortingState={groupedSortingState}
          setGroupedSortingState={setGroupedSortingState}
        />
      </div>
    </div>
  );
}

export default TransactionsPage;
