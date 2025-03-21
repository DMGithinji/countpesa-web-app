import { useCallback, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import useTransactionStore from "@/stores/transactions.store";
import transactionRepository from "@/database/TransactionRepository";
import { CompositeFilter } from "@/types/Filters";
import { Transaction } from "@/types/Transaction";
import useCategoriesStore from "@/stores/categories.store";
import categoryRepository from "@/database/CategoryRepository";
import useCategories from "./useCategories";

export function useTransactions() {
  const transactions = useTransactionStore(state => state.transactions);
  const setTransactions = useTransactionStore(state => state.setTransactions);
  const currentFilters = useTransactionStore(state => state.currentFilters);
  const setCurrentFilters = useTransactionStore(state => state.setCurrentFilters);

  const categoriesWithSubcategories = useCategoriesStore(state => state.categoriesWithSubcategories);
  const { reloadCategories } = useCategories();

  const loadTransactions = useCallback(async () => {
    const trs = await transactionRepository.getTransactions(currentFilters);
    setTransactions(trs);
  }, [currentFilters, setTransactions]);

  const handleCategorizeTransactions = useCallback(async (trId: string, categoryToSet: string) => {
    const { category, subcategory } = deconstructTrCategory(categoryToSet);
    const categoryExists = categoriesWithSubcategories.find(c => c.name === category);
    const subcategExists = categoryExists && categoryExists.subcategories.find(sub => sub.name === subcategory);

    if (!categoryExists) {
      const categId = await categoryRepository.addCategory({name: category});
      if (categId && subcategory && !subcategExists) {
        await categoryRepository.addSubcategory({name: subcategory, categoryId: categId});
        reloadCategories()
      }
    }
    if (categoryExists?.id && !subcategExists) {
      await categoryRepository.addSubcategory({name: subcategory, categoryId: categoryExists.id});
      reloadCategories()
    }

    console.log({ category, subcategory, categoryToSet })
    await transactionRepository.categorizeTransaction(trId, categoryToSet);

    loadTransactions();
  }, [categoriesWithSubcategories, reloadCategories, loadTransactions]);

  const handleBulkUpdateTransactions = useCallback(async (updatedTrs: Transaction[]) => {
    await transactionRepository.bulkUpdate(updatedTrs);
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loadTransactions,
    setCurrentFilters,
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


export function useLoadTransactions() {
  const setTransactions = useTransactionStore(state => state.setTransactions);
  const currentFilters = useTransactionStore(state => state.currentFilters);
  const setCurrentFilters = useTransactionStore(state => state.setCurrentFilters);
  const loading = useTransactionStore(state => state.loading);
  const setLoading = useTransactionStore(state => state.setLoading);
  const setError = useTransactionStore(state => state.setError);

  const { loadTransactions } = useTransactions();

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
  }, [setCurrentFilters, setError, setLoading]); // Empty dependency array means this runs once on mount


  useEffect(() => {
    if (loading) return;

    loadTransactions();
  }, [currentFilters, loading, loadTransactions, setTransactions]);
}
