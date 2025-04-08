import { useMemo, useState } from "react";
import { createTransactionColumns } from "@/components/TransactionsTable/Columns";
import { DataTable } from "@/components/ui/table/DataTable";
import { Transaction } from "@/types/Transaction";
import CategorizeModal from "../CategorizeModal";

export type SortBy = {
  desc: boolean;
  id: keyof Transaction;
};

function IndividualTrsTable({
  transactions,
  sortBy,
  onSortingChange,
  pageIndex = 0,
  onPageChange,
}: {
  transactions: Transaction[];
  sortBy: SortBy;
  onSortingChange: (sorting: SortBy) => void;
  pageIndex: number;
  onPageChange: (newPage: number) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const handleCategoryClick = (transaction: Transaction) => {
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
        pageIndex={pageIndex}
        onPageChange={onPageChange}
        initialSorting={[sortBy]}
        onSortingChange={(sorting) => onSortingChange(sorting[0] as SortBy)}
      />
      {selectedTransaction && (
        <CategorizeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          transaction={selectedTransaction}
        />
      )}
    </>
  );
}

export default IndividualTrsTable;
