import { useMemo, useState } from "react";
import { transactionColumns } from "@/components/TransactionsTable/Columns";
import { DataTable } from "@/components/ui/table/DataTable";
import { Transaction } from "@/types/Transaction";

const Table = ({
  transactions
}: { transactions: Transaction[]}) => {
  const [page, setPage] = useState(1);
  const displayedTrs = useMemo(() => {
    return transactions.slice((page - 1) * 10, page * 10);
  }, [page, transactions]);

  return (
      <DataTable
        data={displayedTrs}
        columns={transactionColumns}
        totalCount={transactions.length}
        pageSize={10}
        pageIndex={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
      />
  );
};

export default Table;
