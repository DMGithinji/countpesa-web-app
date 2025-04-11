import { useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TransactionSearch } from "@/components/SearchInput";
import AmtSummaryCardWithTrend from "@/components/AmtSummaryCardWithTrend";
import { SortBy as IndividualSortBy } from "@/components/TransactionsTable/IndividualTrsTable";
import { SortBy as GroupedSortBy } from "@/components/GroupedTrsTable/Table";
import { Period } from "@/lib/groupByPeriod";
import { filterTransactions, sortBy } from "@/lib/utils";
import { MoneyMode } from "@/types/Transaction";
import useTransactionStore from "@/stores/transactions.store";
import TransactionPageTable from "@/components/TransactionsTable/TrsPageTables";

type PeriodOption = Period | "all";

function TransactionsPage() {
  const [groupBy, setGroupBy] = useState<PeriodOption>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageIndex, setPageIndex] = useState(0);
  const [sortingState, setSortingState] = useState<IndividualSortBy>({
    desc: true,
    id: "date",
  });
  const [groupedSortingState, setGroupedSortingState] = useState<GroupedSortBy>({
    desc: true,
    id: "name",
  });

  const transactions = useTransactionStore((state) => state.transactions);
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const dateRangeData = useTransactionStore((state) => state.dateRangeData);
  const periodAverages = useTransactionStore((state) => state.periodAverages);
  const { defaultPeriod, periodOptions } = dateRangeData;
  const { transactionTotals } = calculatedData;

  const filteredTrs = useMemo(() => {
    const filtered = filterTransactions(transactions, searchQuery);
    const sorted = sortBy(filtered, sortingState.id, sortingState.desc ? "desc" : "asc");
    return sorted;
  }, [searchQuery, transactions, sortingState]);

  return (
    <div className="flex flex-col gap-12">
      <div className="grid gap-8 grid-cols-2 md:grid-cols-2">
        <AmtSummaryCardWithTrend
          type="Received"
          count={transactionTotals.moneyInCount}
          amount={transactionTotals.moneyInAmount}
          mode={MoneyMode.MoneyIn}
          transactions={transactionTotals.moneyInTrs}
          periodOptions={periodOptions}
          defaultPeriod={defaultPeriod}
          periodAverages={periodAverages}
        />
        <AmtSummaryCardWithTrend
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
        <TransactionPageTable
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
