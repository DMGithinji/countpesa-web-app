import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import TransactionsTable from "@/components/TransactionsTable/Table";
import GroupedTransactionsTable from "@/components/GroupedTrsTable/Table";
import { calculateTransactionTotals } from "@/lib/getTotal";
import { TransactionSummary } from "@/lib/groupByField";
import { groupTransactionsByPeriod, Period } from "@/lib/groupByPeriod";
import useTransactionStore from "@/stores/transactions.store";
import { useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { TransactionSearch } from "@/components/SearchInput";
import { Transaction } from "@/types/Transaction";
import { filterTransactions } from "@/lib/utils";

const TransactionsPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const [groupBy, setGroupBy] = useState<"all" | Period>(Period.DATE);
  const loading = useTransactionStore((state) => state.loading);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredTrs = useMemo(() => filterTransactions(transactions, searchQuery), [
    searchQuery,
    transactions,
  ]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <TransactionSearch onSearch={setSearchQuery} />
        <ToggleGroup type="single" value={groupBy}>
          {["all", ...Object.values(Period).slice(1)].map((grouping) => (
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
      <Table transactions={filteredTrs} groupBy={groupBy} />
    </div>
  );
};

export default TransactionsPage;

function Table({
  transactions,
  groupBy,
}: {
  transactions: Transaction[];
  groupBy: "all" | Period;
}) {
  switch (groupBy) {
    case "all":
      return (
        <div className="container mx-auto max-w-5xl">
          <TransactionsTable transactions={transactions} />
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
          />
        </div>
      );
    }
  }
}
