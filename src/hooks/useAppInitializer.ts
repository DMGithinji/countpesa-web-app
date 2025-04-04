import { useCallback, useEffect } from "react";
import useCategories from "./useCategories";
import transactionRepository from "@/database/TransactionRepository";
import useTransactionStore from "@/stores/transactions.store";
import { useLoadInitialTransactions, useTransactions } from "./useTransactions";

function useAppInitializer() {
  const { loadDefaultFilters } = useLoadInitialTransactions();
  const { loadTransactions } = useTransactions();
  const { preloadDefaultCategories } = useCategories();
  const loading = useTransactionStore((state) => state.loading);
  const setAllTransactions = useTransactionStore(
    (state) => state.setAllTransactions
  );

  const setTransactions = useCallback(async () => {
    const allTransactions = await transactionRepository.getTransactions();
    setAllTransactions(allTransactions);
  }, []);

  useEffect(() => {
    setTransactions();
    preloadDefaultCategories();
    loadDefaultFilters();
  }, [loadDefaultFilters, preloadDefaultCategories, setTransactions]);

  useEffect(() => {
    if (loading) return;
    loadTransactions();
  }, [loadTransactions, loading]);
}

export default useAppInitializer;
