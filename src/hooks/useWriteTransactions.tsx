import { useCallback } from "react";
import { useTransactionRepository } from "@/context/DBContext";
import useAddMissingCategories from "./useAddCategories";
import { Transaction } from "@/types/Transaction";
import { useLoadTransactions } from "./useLoadTransactions";

export function useWriteTransactions() {
  const transactionRepository = useTransactionRepository();
  const { addMissingCategories } = useAddMissingCategories();
  const {loadTransactions} = useLoadTransactions();

  const handleCategorizeTransactions = useCallback(
    async (trId: string, categoryToSet: string) => {
      await addMissingCategories(categoryToSet);
      await transactionRepository.categorizeTransaction(trId, categoryToSet);
      loadTransactions();
    },
    [addMissingCategories, loadTransactions, transactionRepository]
  );

  const handleBulkUpdateTransactions = useCallback(
    async (updatedTrs: Transaction[]) => {
      await transactionRepository.bulkUpdate(updatedTrs);
      loadTransactions();
    },
    [loadTransactions, transactionRepository]
  );

  return {
    categorizeTransaction: handleCategorizeTransactions,
    bulkUpdateTransactions: handleBulkUpdateTransactions,
  };
}
