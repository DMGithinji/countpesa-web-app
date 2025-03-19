import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import TransactionsTable from "@/components/GroupedTrsTable/Table";
import { TransactionSearch } from "@/components/SearchInput";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
} from "@/lib/groupByField";
import { filterTransactions } from "@/lib/utils";
import useTransactionStore from "@/stores/transactions.store";
import { useMemo, useState } from "react";

const AccountsPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto max-w-5xl">
      <div className="flex justify-between items-center mb-4">
        <TransactionSearch onSearch={setSearchQuery} />
      </div>
      <TransactionsTable transactions={groupedTrs} columnDef={columnDef} />
    </div>
  );
};

export default AccountsPage;
