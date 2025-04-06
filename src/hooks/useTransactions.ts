import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  startOfMonth,
  endOfMonth,
  isAfter,
  endOfDay,
  isBefore,
} from "date-fns";
import useTransactionStore from "@/stores/transactions.store";
import { Transaction } from "@/types/Transaction";
import { Filter, FilterMode } from "@/types/Filters";
import { useAddMissingCategories } from "@/lib/categoryUtils";
import { useDemoMode, useTransactionRepository } from "@/context/DBContext";

export function useLoadInitialTransactions() {
  const transactionRepository = useTransactionRepository();
  const isDemoMode = useDemoMode();

  const setAllTransactions = useTransactionStore(
    (state) => state.setAllTransactions
  );
  const setCurrentFilters = useTransactionStore(
    (state) => state.setCurrentFilters
  );
  const setLoading = useTransactionStore((state) => state.setLoading);
  const setError = useTransactionStore((state) => state.setError);

  const navigate = useNavigate();

  const loadInitialTransactions = useCallback(async () => {
    setLoading(false);
    try {
      const trs = await transactionRepository.getTransactions();
      const earliestTrDate = trs.length ? new Date(trs[0].date) : new Date();
      const latestTrDate = trs.length
        ? new Date(trs[trs.length - 1].date)
        : new Date();

      const startDate = startOfMonth(latestTrDate);
      const endDate = endOfMonth(latestTrDate);
      const start = isBefore(startDate, earliestTrDate)
        ? earliestTrDate
        : startDate;
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
      if (!trs.length && !isDemoMode) {
        navigate("/");
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to fetch transactions");
      setLoading(false);
    }
  }, [isDemoMode, navigate, setAllTransactions, setCurrentFilters, setError, setLoading, transactionRepository]);

  return { loadInitialTransactions };
}

export function useWriteTransactions() {
  const transactionRepository = useTransactionRepository();
  const { addMissingCategories } = useAddMissingCategories();
  const setAllTransactions = useTransactionStore(
    (state) => state.setAllTransactions
  );

  const loadTransactions = useCallback(async () => {
    const allTransactions = await transactionRepository.getTransactions();
    setAllTransactions(allTransactions);
  }, [setAllTransactions, transactionRepository]);

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
    loadTransactions,
    categorizeTransaction: handleCategorizeTransactions,
    bulkUpdateTransactions: handleBulkUpdateTransactions,
  };
}
