import { useCallback, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import useTransactionStore from "@/stores/transactions.store";
import transactionRepository from "@/database/TransactionRepository";
import { CompositeFilter } from "@/types/Filters";

export function useTransactions() {
  const {
    transactions,
    setTransactions,
    currentFilters,
    setCurrentFilters,
    loading,
    setLoading,
    setError,
  } = useTransactionStore();

  // Run once on load to set default month filter and fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Set current month filter
        const now = new Date();
        const startDate = startOfMonth(now).getTime();
        const endDate = endOfMonth(now).getTime();

        const dateRangeFilter: CompositeFilter = {
          type: "and",
          filters: [
            {
              field: "date",
              operator: ">=",
              value: startDate,
            },
            {
              field: "date",
              operator: "<=",
              value: endDate,
            },
          ],
        };

        setCurrentFilters(dateRangeFilter);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("Failed to fetch transactions");
      }
    };

    fetchTransactions();
  }, []); // Empty dependency array means this runs once on mount

  const loadTransactions = useCallback(async () => {
    const trs = await transactionRepository.getTransactions(currentFilters);
    setTransactions(trs);
  }, [currentFilters, setTransactions]);

  useEffect(() => {
    if (loading) return;

    loadTransactions();
  }, [currentFilters, loading, loadTransactions, setTransactions]);

  return {
    transactions,
    loadTransactions,
    setCurrentFilters
  };
}
