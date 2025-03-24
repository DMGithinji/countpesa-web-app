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
import useSidepanelStore, { SidepanelMode, SidepanelTransactions } from "@/stores/sidepanel.store";
import { MoneyMode } from "@/types/Transaction";
import { useCallback, useMemo, useState } from "react";

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

  const setSidepanelMode = useSidepanelStore((state) => state.setMode)
  const setTransactionsData = useSidepanelStore((state) => state.setTransactionsData)

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


  const handlePieChartClick = useCallback((summary: SidepanelTransactions) => {
    setTransactionsData(summary)
    setSidepanelMode(SidepanelMode.Transactions)
  }, [setSidepanelMode, setTransactionsData])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <TopAccountsChart
          moneyMode={MoneyMode.MoneyIn}
          totalAmount={transactionTotals.moneyInAmount}
          groupedDataByAmount={topAccountsReceivedFromByAmt}
          groupedDataByCount={topAccountsReceivedFromByCount}
          onItemClick={handlePieChartClick}
        />
        <TopAccountsChart
          moneyMode={MoneyMode.MoneyOut}
          totalAmount={transactionTotals.moneyOutAmount}
          groupedDataByAmount={topAccountsSentToByAmt}
          groupedDataByCount={topAccountsSentToByCount}
          onItemClick={handlePieChartClick}
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
    </>
  );
};

export default AccountsPage;
