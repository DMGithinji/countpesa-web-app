import { useCallback, useState } from "react";
import { DataTable } from "@/components/ui/table/DataTable";
import { TransactionSummary } from "@/lib/groupByField";
import { ColumnDef } from "@tanstack/react-table";
import useSidepanelStore, { SidepanelMode } from "@/stores/ui.store";

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
  const setSidepanelMode = useSidepanelStore((state) => state.setSidepanelMode)
  const setTransactionsData = useSidepanelStore((state) => state.setSidepanelTransactions)

  const handleOnRowClick = useCallback((summary: TransactionSummary) => {
    setTransactionsData(summary)
    setSidepanelMode(SidepanelMode.Transactions)
  }, [setSidepanelMode, setTransactionsData])

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
        onRowClick={handleOnRowClick}
      />
  );
};

export default Table;
