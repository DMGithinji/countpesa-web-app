import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import { Transaction } from "@/types/Transaction";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { TransactionSummary } from "@/lib/groupByField";
import GroupedTransactionsTable, { SortBy as GroupedSortBy } from "../GroupedTrsTable/Table";
import { transactionGroupSummaryColumns } from "../GroupedTrsTable/Columns";
import IndividualTrsTable, { SortBy as IndividualSortBy } from "./IndividualTrsTable";

function TransactionPageTable({
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
  sortingState: IndividualSortBy;
  onSortingChange: (sortDir: IndividualSortBy) => void;
  groupedSortingState: GroupedSortBy;
  setGroupedSortingState: (sortByField: GroupedSortBy) => void;
}) {
  switch (groupBy) {
    case "all":
      return (
        <IndividualTrsTable
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

export default TransactionPageTable;
