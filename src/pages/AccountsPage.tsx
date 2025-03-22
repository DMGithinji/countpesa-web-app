import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import TransactionsTable, { SortBy } from "@/components/GroupedTrsTable/Table";
import { TransactionSearch } from "@/components/SearchInput";
import TopAccountsChart from "@/components/TopAccountsChart";
import { useTransactionContext } from "@/context/TransactionDataContext";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
} from "@/lib/groupByField";
import { filterTransactions, sortBy } from "@/lib/utils";
import { MoneyMode } from "@/types/Transaction";
import { useMemo, useState } from "react";

const AccountsPage = () => {
  const { transactions, calculatedData } = useTransactionContext();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    transactionTotals,
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topAccountsReceivedFromByCount,
    topAccountsSentToByCount,
  } = calculatedData;

  const columnDefProps = { title: "Sender/Receiver" };
  const columnDef = transactionGroupSummaryColumns(columnDefProps);

  const [sortingState, setSortingState] = useState<SortBy>({
    desc: false,
    id: GroupByTrxSortBy.MoneyOut,
  })

  const groupedTrs = useMemo(() => {
    const filteredTrs = filterTransactions(transactions, searchQuery)
    const groupedTrx = groupedTrxByField(filteredTrs, GroupByField.Account);
    return sortBy(groupedTrx, sortingState.id, sortingState.desc ? 'desc' : 'asc');
  }, [searchQuery, transactions, sortingState]);

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
        <TransactionsTable
          transactions={groupedTrs}
          columnDef={columnDef}
          onSortingChange={setSortingState}
          sortBy={sortingState}
        />
      </div>
    </div>
  );
};

export default AccountsPage;
