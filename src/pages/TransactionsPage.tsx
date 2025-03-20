import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import TransactionsTable, { SortBy } from "@/components/TransactionsTable/Table";
import GroupedTransactionsTable, { SortBy as GroupedSortBy } from "@/components/GroupedTrsTable/Table";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { TransactionSummary } from "@/lib/groupByField";
import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import useTransactionStore from "@/stores/transactions.store";
import { useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TransactionSearch } from "@/components/SearchInput";
import { MoneyMode, Transaction } from "@/types/Transaction";
import { filterTransactions, sortBy } from "@/lib/utils";
import AmtSummaryCard2 from "@/components/AmtSummaryCard2";
import { useCalculate } from "@/hooks/useCalculate";
import { useDateRange } from "@/hooks/useDateRange";

const TransactionsPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const { defaultPeriod, periodOptions } = useDateRange();
  const { transactionTotals } = useCalculate();

  const [groupBy, setGroupBy] = useState<"all" | Period>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
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
    const sorted = sortBy(
      filtered,
      sortingState.id,
      sortingState.desc ? "desc" : "asc"
    );
    return sorted;
  }, [searchQuery, transactions, sortingState]);

  return (
    <div className="container mx-auto max-w-5xl flex flex-col gap-12">
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <AmtSummaryCard2
          type="Received"
          count={transactionTotals.moneyInCount}
          amount={transactionTotals.moneyInAmount}
          mode={MoneyMode.MoneyIn}
          transactions={transactionTotals.moneyInTrs}
          periodOptions={periodOptions}
          defaultPeriod={defaultPeriod}
        />
        <AmtSummaryCard2
          type="Sent"
          count={transactionTotals.moneyOutCount}
          amount={transactionTotals.moneyOutAmount}
          mode={MoneyMode.MoneyOut}
          transactions={transactionTotals.moneyOutTrs}
          periodOptions={periodOptions}
          defaultPeriod={defaultPeriod}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <TransactionSearch onSearch={setSearchQuery} />
          <ToggleGroup type="single" value={groupBy}>
            {["all", ...periodOptions].map((grouping) => (
              <ToggleGroupItem
                className={"cursor-pointer px-4 capitalize"}
                onClick={() => setGroupBy(grouping as Period | "all")}
                value={grouping}
                key={grouping}
              >
                {grouping}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <Table
          transactions={filteredTrs}
          groupBy={groupBy}
          sortBy={sortingState}
          onSortingChange={setSortingState}
          groupedSortingState={groupedSortingState}
          setGroupedSortingState={setGroupedSortingState}
        />
      </div>
    </div>
  );
};

export default TransactionsPage;

function Table({
  transactions,
  groupBy,
  sortBy,
  onSortingChange,
  groupedSortingState,
  setGroupedSortingState,
}: {
  transactions: Transaction[];
  groupBy: "all" | Period;
  sortBy: SortBy;
  onSortingChange: (sortBy: SortBy) => void;
  groupedSortingState: GroupedSortBy;
  setGroupedSortingState: (sortBy: GroupedSortBy) => void;
}) {
  switch (groupBy) {
    case "all":
      return (
        <div className="container mx-auto max-w-5xl">
          <TransactionsTable
            transactions={transactions}
            sortBy={sortBy}
            onSortingChange={onSortingChange}
          />
        </div>
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
        const transactions = grouped[key];
        const trsTotals = calculateTransactionTotals(transactions);
        return {
          name: key,
          transactions,
          ...trsTotals,
        };
      });

      return (
        <div className="container mx-auto max-w-5xl">
          <GroupedTransactionsTable
            transactions={summary}
            columnDef={columnDef}
            sortBy={groupedSortingState}
            onSortingChange={setGroupedSortingState}
          />
        </div>
      );
    }
  }
}
