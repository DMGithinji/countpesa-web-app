import { useCallback } from "react";
import { startOfMonth, endOfMonth, isAfter, endOfDay, isBefore } from "date-fns";
import useTransactionStore from "@/stores/transactions.store";
import transactionRepository from "@/database/TransactionRepository";
import { Transaction } from "@/types/Transaction";
import { Filter, FilterMode } from "@/types/Filters";
import { addMissingCategories } from "@/lib/categoryUtils";

export function useTransactions() {
  const setAllTransactions = useTransactionStore(state => state.setAllTransactions);

  const loadTransactions = useCallback(async () => {
    const allTransactions = await transactionRepository.getTransactions();
    setAllTransactions(allTransactions);
  }, [setAllTransactions]);

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

export function useLoadInitialTransactions() {
  const setAllTransactions = useTransactionStore(state => state.setAllTransactions);
  const setCurrentFilters = useTransactionStore(state => state.setCurrentFilters);
  const setLoading = useTransactionStore(state => state.setLoading);
  const setError = useTransactionStore(state => state.setError);

  const loadInitialTransactions = useCallback(async () => {
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
            mode: FilterMode.AND,
          },
          {
            field: "date",
            operator: "<=",
            value: end.getTime(),
            mode: FilterMode.AND,
          },
        ];

      setCurrentFilters(dateRangeFilter);
      setAllTransactions(trs);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions");
    }
  }, []);

  return { loadInitialTransactions }
}
