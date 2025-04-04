import { useCallback } from "react";
import { startOfMonth, endOfMonth, isAfter, endOfDay, isBefore } from "date-fns";
import useTransactionStore from "@/stores/transactions.store";
import transactionRepository from "@/database/TransactionRepository";
import { Transaction } from "@/types/Transaction";
import { Filter } from "@/types/Filters";
import { addMissingCategories } from "@/lib/categoryUtils";

export function useTransactions() {
  const currentFilters = useTransactionStore(state => state.currentFilters);
  const setTransactions = useTransactionStore(state => state.setTransactions);

  const loadTransactions = useCallback(async () => {
    // time how long it takes to load transactions
    const start = performance.now();
    const trs = await transactionRepository.getTransactions(currentFilters);
    console.log(`Loaded ${trs.length} transactions in ${(performance.now() - start).toFixed(2)}ms`);
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
      const earliestTrDate = trs.length ? new Date(trs[0].date) : new Date();
      const latestTrDate = trs.length ? new Date(trs[trs.length - 1].date) : new Date();

      const startDate = startOfMonth(latestTrDate);
      const endDate = endOfMonth(latestTrDate);
      const start = isBefore(startDate, earliestTrDate) ? earliestTrDate : startDate;
      const end = isAfter(endDate, new Date()) ? endOfDay(new Date()) : endDate;

      const dateRangeFilter: Filter[] = [
          {
            field: "date",
            operator: ">=",
            value: start.getTime(),
            mode: "and",
          },
          {
            field: "date",
            operator: "<=",
            value: end.getTime(),
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
