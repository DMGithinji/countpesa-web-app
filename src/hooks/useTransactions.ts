import { useCallback } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import useTransactionStore from "@/stores/transactions.store";
import transactionRepository from "@/database/TransactionRepository";
import { Transaction } from "@/types/Transaction";
import { Filter } from "@/types/Filters";
import { addMissingCategories } from "@/lib/categoryUtils";

export function useTransactions() {
  const currentFilters = useTransactionStore(state => state.currentFilters);
  const setTransactions = useTransactionStore(state => state.setTransactions);

  const loadTransactions = useCallback(async () => {
    const trs = await transactionRepository.getTransactions(currentFilters);
    setTransactions(trs);
  }, [currentFilters, setTransactions]);

  const handleCategorizeTransactions = useCallback(async (trId: string, categoryToSet: string) => {
    await addMissingCategories(categoryToSet);
    await transactionRepository.categorizeTransaction(trId, categoryToSet);
    loadTransactions();
  }, [loadTransactions]);

  const handleBulkUpdateTransactions = useCallback(async (updatedTrs: Transaction[]) => {
    await transactionRepository.bulkUpdate(updatedTrs);
    loadTransactions();
  }, [loadTransactions]);

  return {
    loadTransactions,
    categorizeTransaction: handleCategorizeTransactions,
    getRelatedTransactions: transactionRepository.getRelatedTransactions,
    bulkUpdateTransactions: handleBulkUpdateTransactions
  };
}

export const formatTrCategory = (category: string, subcategory: string) => {
  if (!subcategory) return category;
  return `${category}: ${subcategory}`;
};

export const deconstructTrCategory = (category: string) => {
  const parts = category.split(":");
  if (parts.length === 1) return { category: parts[0], subcategory: '' };
  return { category: parts[0].trim(), subcategory: parts[1].trim() };
};


export function useLoadInitialTransactions() {
  const setCurrentFilters = useTransactionStore(state => state.setCurrentFilters);
  const setLoading = useTransactionStore(state => state.setLoading);
  const setError = useTransactionStore(state => state.setError);

  const fetchTransactions = useCallback(async () => {
    try {
      const trs = await transactionRepository.getTransactions();
      const latestTrDate = trs.length ? new Date(trs[trs.length - 1].date) : new Date();

      const startDate = startOfMonth(latestTrDate).getTime();
      const endDate = endOfMonth(latestTrDate).getTime();

      const dateRangeFilter: Filter[] = [
          {
            field: "date",
            operator: ">=",
            value: startDate,
            mode: "and",
          },
          {
            field: "date",
            operator: "<=",
            value: endDate,
            mode: "and",
          },
        ];

      setCurrentFilters(dateRangeFilter);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions");
    }
  }, []);

  return { fetchTransactions }
}
