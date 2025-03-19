import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/table/DataTable";
import { TransactionSummary } from "@/lib/groupByField";
import { ColumnDef } from "@tanstack/react-table";

const Table = ({
  transactions,
  columnDef
}: {
  transactions: TransactionSummary[],
  columnDef: ColumnDef<TransactionSummary>[]
}) => {
  const [page, setPage] = useState(1);
  const displayedTrs = useMemo(() => {
    return transactions.slice((page - 1) * 10, page * 10);
  }, [page, transactions]);

  return (
      <DataTable
        data={displayedTrs}
        columns={columnDef}
        totalCount={transactions.length}
        pageSize={10}
        pageIndex={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />
  );
};

export default Table;
