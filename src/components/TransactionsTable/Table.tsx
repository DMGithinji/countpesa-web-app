import { useState } from "react";
import { transactionColumns } from "@/components/TransactionsTable/Columns";
import { DataTable } from "@/components/ui/table/DataTable";
import { Transaction } from "@/types/Transaction";

export type SortBy = {
  desc: boolean;
  id: keyof Transaction;
};

const Table = ({
  transactions,
  sortBy,
  onSortingChange,
}: {
  transactions: Transaction[];
  sortBy: SortBy;
  onSortingChange: (sorting: SortBy) => void;
}) => {
  const [page, setPage] = useState(1);

  return (
    <DataTable
      data={transactions} // Pass ALL transactions, not just the sliced subset
      columns={transactionColumns}
      totalCount={transactions.length}
      pageIndex={page - 1}
      onPageChange={(newPage) => setPage(newPage + 1)}
      initialSorting={[sortBy]}
      onSortingChange={(sorting) => onSortingChange(sorting[0] as SortBy)}
    />
  );
};

export default Table;
