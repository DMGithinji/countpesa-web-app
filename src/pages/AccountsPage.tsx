import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import TransactionsTable from "@/components/GroupedTrsTable/Table";
import { TransactionSearch } from "@/components/SearchInput";
import TopAccountsChart from "@/components/TopAccountsChart";
import { useCalculate } from "@/hooks/useCalculate";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
} from "@/lib/groupByField";
import { filterTransactions } from "@/lib/utils";
import useTransactionStore from "@/stores/transactions.store";
import { MoneyMode } from "@/types/Transaction";
import { useMemo, useState } from "react";

const AccountsPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    transactionTotals,
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topAccountsReceivedFromByCount,
    topAccountsSentToByCount,
  } = useCalculate();

  const columnDefProps = { title: "Sender/Receiver" };
  const columnDef = transactionGroupSummaryColumns(columnDefProps);
  const [sortBy, setSortBy] = useState<GroupByTrxSortBy>(
    GroupByTrxSortBy.MoneyOut
  );

  const filteredTrs = useMemo(
    () => filterTransactions(transactions, searchQuery),
    [searchQuery, transactions]
  );

  const groupedTrs = useMemo(() => {
    return groupedTrxByField(filteredTrs, GroupByField.Account, sortBy);
  }, [filteredTrs, sortBy]);

  return (
    <div className="container mx-auto max-w-5xl flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <TopAccountsChart
          moneyMode={MoneyMode.MoneyIn}
          totalAmount={transactionTotals.moneyInAmount}
          groupedDataByAmount={topAccountsReceivedFromByAmt.map((t) => ({
            name: t.name,
            amount: t.amount,
            count: t.count,
          }))}
          groupedDataByCount={topAccountsReceivedFromByCount.map((t) => ({
            name: t.name,
            amount: t.amount,
            count: t.count,
          }))}
        />
        <TopAccountsChart
          moneyMode={MoneyMode.MoneyOut}
          totalAmount={transactionTotals.moneyOutAmount}
          groupedDataByAmount={topAccountsSentToByAmt.map((t) => ({
            name: t.name,
            amount: t.amount,
            count: t.count,
          }))}
          groupedDataByCount={topAccountsSentToByCount.map((t) => ({
            name: t.name,
            amount: t.amount,
            count: t.count,
          }))}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <TransactionSearch onSearch={setSearchQuery} />
        </div>
        <TransactionsTable transactions={groupedTrs} columnDef={columnDef} />
      </div>
    </div>
  );
};

export default AccountsPage;
