import { useState } from "react";
import { DataTable } from "@/components/ui/table/DataTable";
import { TransactionSummary } from "@/lib/groupByField";
import { ColumnDef } from "@tanstack/react-table";

const PAGE_SIZE = 10;
export type SortBy = {
  desc: boolean;
  id: keyof TransactionSummary;
}

const Table = ({
  transactions,
  columnDef,
  sortBy,
  onSortingChange,
}: {
  transactions: TransactionSummary[],
  columnDef: ColumnDef<TransactionSummary>[],
  sortBy: SortBy;
  onSortingChange: (sorting: SortBy) => void;
}) => {
  const [page, setPage] = useState(1);

  return (
      <DataTable
        data={transactions}
        columns={columnDef}
        totalCount={transactions.length}
        pageSize={PAGE_SIZE}
        pageIndex={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        initialSorting={[sortBy]}
        onSortingChange={(sorting) => onSortingChange(sorting[0] as SortBy)}
      />
  );
};

export default Table;
