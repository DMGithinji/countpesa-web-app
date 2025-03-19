import { useMemo, useState } from "react";
import TransactionsTable from "@/components/GroupedTrsTable/Table";
import {
  GroupByField,
  GroupByTrxSortBy,
  groupedTrxByField,
} from "@/lib/groupByField";
import useTransactionStore from "@/stores/transactions.store";
import { transactionGroupSummaryColumns } from "@/components/GroupedTrsTable/Columns";
import { filterTransactions } from "@/lib/utils";
import { TransactionSearch } from "@/components/SearchInput";

const CategoriesPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const loading = useTransactionStore((state) => state.loading);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const columnDefProps = { title: "Categories" };
  const columnDef = transactionGroupSummaryColumns(columnDefProps);
  const [sortBy, setSortBy] = useState<GroupByTrxSortBy>(
    GroupByTrxSortBy.MoneyOut
  );

  const filteredTrs = useMemo(
    () => filterTransactions(transactions, searchQuery),
    [searchQuery, transactions]
  );

  const groupedTrs = useMemo(() => {
    return groupedTrxByField(filteredTrs, GroupByField.Category, sortBy);
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

export default CategoriesPage;
