import { useMemo, useState } from "react";
import { DataTable } from "@/components/ui/table/DataTable";
import { TransactionSummary } from "@/lib/groupByField";
import { ColumnDef } from "@tanstack/react-table";

const PAGE_SIZE = 10;

const Table = ({
  transactions,
  columnDef
}: {
  transactions: TransactionSummary[],
  columnDef: ColumnDef<TransactionSummary>[]
}) => {
  const [page, setPage] = useState(1);
  const displayedTrs = useMemo(() => {
    return transactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [page, transactions]);

  return (
      <DataTable
        data={displayedTrs}
        columns={columnDef}
        totalCount={transactions.length}
        pageSize={PAGE_SIZE}
        pageIndex={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />
  );
};

export default Table;
