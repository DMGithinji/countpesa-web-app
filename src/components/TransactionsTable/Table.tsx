import { useMemo, useState } from "react";
import { createTransactionColumns } from "@/components/TransactionsTable/Columns";
import { DataTable } from "@/components/ui/table/DataTable";
import { Transaction } from "@/types/Transaction";
import CategorizeModal from "../CategorizeModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const handleCategoryClick = (transaction: Transaction, category?: string, subcategory?: string) => {
    console.log({transaction, category, subcategory});
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };
  const columns = useMemo(
    () => createTransactionColumns({ onCategoryClick: handleCategoryClick }),
    []
  );

  return (
    <>
      <DataTable
        data={transactions} // Pass ALL transactions, not just the sliced subset
        columns={columns}
        totalCount={transactions.length}
        pageIndex={page - 1}
        onPageChange={(newPage) => setPage(newPage + 1)}
        initialSorting={[sortBy]}
        onSortingChange={(sorting) => onSortingChange(sorting[0] as SortBy)}
      />
      <CategorizeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        onSave={handleCategoryClick}
      />
    </>
  );
};

export default Table;
