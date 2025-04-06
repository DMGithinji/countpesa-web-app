import { Filter } from "@/types/Filters";
import { create } from "zustand";
import { Transaction } from "@/types/Transaction";
import { removeFilters, validateAndAddFilters } from "@/lib/manageFilters";
import {
  CalculatedData,
  DEFAULT_CALCULATED_DATA,
  getCalculatedData,
} from "@/lib/getCalculatedData";
import {
  DateRangeData,
  DEFAULT_DATE_RANGE_DATA,
  getDateRangeData,
} from "@/lib/getDateRangeData";
import { getAllAccountNames } from "@/lib/groupByField";
import { filterTransactions } from "@/lib/filterUtils";
import { getPeriodAverages, PeriodAverages } from "@/lib/groupByPeriod";

interface TransactionState {
  allTransactions: Transaction[];
  transactions: Transaction[];
  currentFilters: undefined | Filter[];
  loading: boolean;
  error: string;

  calculatedData: CalculatedData;
  dateRangeData: DateRangeData;
  accountNames: string[];
  periodAverages: PeriodAverages;

  setAllTransactions: (transactions: Transaction[]) => void;
  setCurrentFilters: (filters: undefined | Filter[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;

  removeFilter: (filters: Filter | Filter[]) => void;
  validateAndAddFilters: (newFilters: Filter | Filter[]) => void;
}

const useTransactionStore = create<TransactionState>((set) => ({
  // Initial state
  allTransactions: [],
  transactions: [],
  currentFilters: undefined,
  loading: true,
  error: "",
  accountNames: [],
  calculatedData: DEFAULT_CALCULATED_DATA,
  dateRangeData: DEFAULT_DATE_RANGE_DATA,
  periodAverages: {},

  // Actions
  setAllTransactions: (transactions) =>
    set((state) => {
      const accountNames = getAllAccountNames(transactions);
      const derivedState = updateDerivedState(
        transactions,
        state.currentFilters
      );

      return {
        allTransactions: transactions,
        accountNames,
        ...derivedState,
      };
    }),

  setCurrentFilters: (filters) =>
    set((state) => {
      const validatedFilters = validateAndAddFilters(filters, []);
      const derivedState = updateDerivedState(
        state.allTransactions,
        validatedFilters
      );

      return {
        currentFilters: validatedFilters,
        ...derivedState,
      };
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  removeFilter: (filter) =>
    set((state) => {
      const updatedFilters = removeFilters(state.currentFilters, filter);
      const derivedState = updateDerivedState(
        state.allTransactions,
        updatedFilters
      );

      return {
        currentFilters: updatedFilters,
        ...derivedState,
      };
    }),

  validateAndAddFilters: (newFilter) =>
    set((state) => {
      const updatedFilters = validateAndAddFilters(
        state.currentFilters,
        newFilter
      );
      const derivedState = updateDerivedState(
        state.allTransactions,
        updatedFilters
      );

      return {
        currentFilters: updatedFilters,
        ...derivedState,
      };
    }),
}));

export default useTransactionStore;

const updateDerivedState = (
  transactions: Transaction[],
  filters: Filter[] | undefined
) => {
  const filteredTransactions = filterTransactions(transactions, filters || []);
  const calculatedData = getCalculatedData(filteredTransactions);

  const dateRangeData = isDateRelatedFilter(filters)
    ? getDateRangeData({
        transactions: filteredTransactions,
        currentFilters: filters,
      })
    : DEFAULT_DATE_RANGE_DATA;

  const periodAverages = getPeriodAverages(dateRangeData, calculatedData);

  return {
    transactions: filteredTransactions,
    calculatedData,
    dateRangeData,
    periodAverages,
  };
};

const isDateRelatedFilter = (
  filter: Filter | Filter[] | undefined
): boolean => {
  if (!filter) return false;
  if (Array.isArray(filter)) {
    return filter.length === 0 || filter.some((f) => f.field === "date");
  }
  return filter.field === "date";
};
