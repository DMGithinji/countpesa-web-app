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
import { MoneyMode, Transaction } from "@/types/Transaction";
import { filterTransactions } from "@/lib/utils";
import AmtSummaryCard2 from "@/components/AmtSummaryCard2";
import { useDashboard } from "@/hooks/useDashboard";
import { useDateRange } from "@/hooks/useDateRange";

const TransactionsPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const { defaultPeriod, periodOptions } = useDateRange();

  const [groupBy, setGroupBy] = useState<"all" | Period>("all");
  const loading = useTransactionStore((state) => state.loading);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { transactionTotals } = useDashboard();

  const filteredTrs = useMemo(
    () =>
      filterTransactions(transactions, searchQuery).sort(
        (a, b) => b.date - a.date
      ),
    [searchQuery, transactions]
  );

  if (loading) {
    return <div>Loading...</div>;
  }

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
            {["all", Period.DATE, ...periodOptions].map((grouping) => (
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
