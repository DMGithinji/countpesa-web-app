import { useCallback, useMemo, useState } from "react";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
  TransactionSummary,
} from "@/lib/groupByField";
import { filterTransactions, sortBy } from "@/lib/utils";
import useSidepanelStore, {
  SidepanelMode,
  SidepanelTransactions,
} from "@/stores/ui.store";
import { MoneyMode, Transaction } from "@/types/Transaction";
import { TransactionSearch } from "@/components/SearchInput";
import TopAccountsChart from "@/components/TopAccountsChart";
import GroupedTrsTable, { SortBy } from "@/components/GroupedTrsTable/Table";

import CategorizeModal from "@/components/CategorizeModal";
import { useTransactionActions } from "@/hooks/useTransactionActions";
import { useTransactionColumns } from "@/hooks/useTransactionColumns";
import useTransactionStore from "@/stores/transactions.store";

const AccountsPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const calculatedData = useTransactionStore((state) => state.calculatedData);
  const validateAndAddFilters = useTransactionStore(state => state.validateAndAddFilters);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    transactionTotals,
    topAccountsSentToByAmt,
    topAccountsReceivedFromByAmt,
    topAccountsReceivedFromByCount,
    topAccountsSentToByCount,
  } = calculatedData;

  const setSidepanelMode = useSidepanelStore((state) => state.setSidepanelMode);
  const setTransactionsData = useSidepanelStore(
    (state) => state.setSidepanelTransactions
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [sortingState, setSortingState] = useState<SortBy>({
    desc: false,
    id: GroupByTrxSortBy.MoneyOut,
  });

  const groupedTrs = useMemo(() => {
    const filteredTrs = filterTransactions(transactions, searchQuery);
    const groupedTrx = groupedTrxByField(filteredTrs, GroupByField.Account);
    return sortBy(
      groupedTrx,
      sortingState.id,
      sortingState.desc ? "desc" : "asc"
    );
  }, [searchQuery, transactions, sortingState]);

  const handleChartClick = useCallback(
    (summary: SidepanelTransactions) => {
      setTransactionsData(summary);
      setSidepanelMode(SidepanelMode.Transactions);
    },
    [setSidepanelMode, setTransactionsData]
  );

  const handleFilterByAccount = useCallback((group: TransactionSummary) => {
    setSelectedTransaction(group.transactions[0]);
    setIsModalOpen(true);
  }, []);

  const actions = useTransactionActions({
    groupByField: GroupByField.Account,
    validateAndAddFilters,
    setTransactionsData,
    setSidepanelMode,
    onCategorizeClick: handleFilterByAccount,
  });

  const columnsWithActions = useTransactionColumns({
    groupByField: GroupByField.Account,
    actions,
    title: "Sender/Receiver",
    onCategoryClick: handleFilterByAccount,
  });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <TopAccountsChart
          moneyMode={MoneyMode.MoneyIn}
          totalAmount={transactionTotals.moneyInAmount}
          groupedDataByAmount={topAccountsReceivedFromByAmt}
          groupedDataByCount={topAccountsReceivedFromByCount}
          onItemClick={handleChartClick}
        />
        <TopAccountsChart
          moneyMode={MoneyMode.MoneyOut}
          totalAmount={transactionTotals.moneyOutAmount}
          groupedDataByAmount={topAccountsSentToByAmt}
          groupedDataByCount={topAccountsSentToByCount}
          onItemClick={handleChartClick}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-4">
          <TransactionSearch onSearch={setSearchQuery} />
        </div>
        <GroupedTrsTable
          transactions={groupedTrs}
          columnDef={columnsWithActions}
          onSortingChange={setSortingState}
          sortBy={sortingState}
        />
      </div>
      {selectedTransaction && (
        <CategorizeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTransaction}
          mode={"multiple"}
        />
      )}
    </>
  );
};

export default AccountsPage;
