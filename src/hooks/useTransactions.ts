import { useCallback } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import useTransactionStore from "@/stores/transactions.store";
import transactionRepository from "@/database/TransactionRepository";
import { Transaction } from "@/types/Transaction";
import useCategoriesStore from "@/stores/categories.store";
import categoryRepository from "@/database/CategoryRepository";
import useCategories from "./useCategories";
import { Filter } from "@/types/Filters";

export function useTransactions() {
  const currentFilters = useTransactionStore(state => state.currentFilters);
  const setTransactions = useTransactionStore(state => state.setTransactions);

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

    await transactionRepository.categorizeTransaction(trId, categoryToSet);

    loadTransactions();
  }, [categoriesWithSubcategories, reloadCategories, loadTransactions]);

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
