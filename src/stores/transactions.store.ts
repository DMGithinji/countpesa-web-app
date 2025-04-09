import { create } from "zustand";
import { Filter } from "@/types/Filters";
import { Transaction } from "@/types/Transaction";
import { removeFilters, validateAndAddFilters } from "@/lib/manageFilters";
import {
  CalculatedData,
  DEFAULT_CALCULATED_DATA,
  getCalculatedData,
} from "@/lib/getCalculatedData";
import { DateRangeData, DEFAULT_DATE_RANGE_DATA, getDateRangeData } from "@/lib/getDateRangeData";
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
  accountCategoryDict: Record<string, string>;

  setAllTransactions: (transactions: Transaction[]) => void;
  setCurrentFilters: (filters: undefined | Filter[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;

  removeFilter: (filters: Filter | Filter[]) => void;
  validateAndAddFilters: (newFilters: Filter | Filter[]) => void;
}

export type DerivedState = {
  transactions: Transaction[];
  dateRangeData: DateRangeData;
  calculatedData: CalculatedData;
  periodAverages?: PeriodAverages;
};
export const getDerivedState = (
  transactions: Transaction[],
  filters: Filter[] | undefined
): DerivedState => {
  const filteredTransactions = filterTransactions(transactions, filters || []);
  const calculatedData = getCalculatedData(filteredTransactions);

  const dateRangeData = getDateRangeData({
    transactions: filteredTransactions,
    currentFilters: filters,
  });

  const periodAverages = getPeriodAverages(dateRangeData, calculatedData);

  return {
    transactions: filteredTransactions,
    calculatedData,
    dateRangeData,
    periodAverages,
  };
};

const useTransactionStore = create<TransactionState>((set) => ({
  // Initial state
  allTransactions: [],
  transactions: [],
  currentFilters: undefined,
  loading: true,
  error: "",
  accountNames: [],
  accountCategoryDict: {},
  calculatedData: DEFAULT_CALCULATED_DATA,
  dateRangeData: DEFAULT_DATE_RANGE_DATA,
  periodAverages: {},

  // Actions
  setAllTransactions: (transactions) =>
    set((state) => {
      const { accountNames, accountCategoryDict } = getAllAccountNames(transactions);
      const derivedState = getDerivedState(transactions, state.currentFilters);

      return {
        allTransactions: transactions,
        accountNames,
        accountCategoryDict,
        ...derivedState,
      };
    }),

  setCurrentFilters: (filters) =>
    set((state) => {
      const validatedFilters = validateAndAddFilters(filters, []);
      const derivedState = getDerivedState(state.allTransactions, validatedFilters);

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
      const derivedState = getDerivedState(state.allTransactions, updatedFilters);

      return {
        currentFilters: updatedFilters,
        ...derivedState,
      };
    }),

  validateAndAddFilters: (newFilter) =>
    set((state) => {
      const updatedFilters = validateAndAddFilters(state.currentFilters, newFilter);
      const derivedState = getDerivedState(state.allTransactions, updatedFilters);

      return {
        currentFilters: updatedFilters,
        ...derivedState,
      };
    }),
}));

export default useTransactionStore;
