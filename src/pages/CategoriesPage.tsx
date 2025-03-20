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
import { useCalculate } from "@/hooks/useCalculate";
import { MoneyMode } from "@/types/Transaction";
import CategoriesChart from "@/components/CategoriesChart";

const CategoriesPage = () => {
  const transactions = useTransactionStore((state) => state.transactions);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const {
    transactionTotals,
    topCategoriesMoneyInByAmt,
    topCategoriesMoneyOutByAmt,
  } = useCalculate();

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

  return (
    <div className="container mx-auto max-w-5xl flex flex-col gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
        <CategoriesChart
          title="Money In"
          moneyMode={MoneyMode.MoneyIn}
          totalAmount={transactionTotals.moneyInAmount}
          groupedDataByAmount={topCategoriesMoneyInByAmt.map((t) => ({
            name: t.name,
            amount: t.amount,
            count: t.count,
            percentage: t.amountPercentage
          }))}
        />
        <CategoriesChart
          title="Money Out"
          moneyMode={MoneyMode.MoneyOut}
          totalAmount={transactionTotals.moneyOutAmount}
          groupedDataByAmount={topCategoriesMoneyOutByAmt.map((t) => ({
            name: t.name,
            amount: t.amount,
            count: t.count,
            percentage: t.amountPercentage
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

export default CategoriesPage;
