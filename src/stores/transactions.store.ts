import { Filter } from "@/types/Filters";
import { create } from "zustand";
import { Transaction } from "@/types/Transaction";
import { removeFilters, validateAndAddFilters } from "@/lib/manageFilters";
import { CalculatedData, DEFAULT_CALCULATED_DATA, getCalculatedData } from "@/lib/getCalculatedData";
import { DateRangeData, DEFAULT_DATE_RANGE_DATA, getDateRangeData } from "@/lib/getDateRangeData";
import { getAllAccountNames } from "@/lib/groupByField";

const filterIsDateRelated = (filter: Filter | Filter[]) => Array.isArray(filter) && filter.some(f => f.field === 'date') || !Array.isArray(filter) && filter.field === 'date'
interface TransactionState {
  allTransactions: Transaction[];
  transactions: Transaction[];
  currentFilters: undefined | Filter[];
  loading: boolean;
  error: string;

  calculatedData: CalculatedData;
  dateRangeData: DateRangeData;
  accountNames: string[];

  setAllTransactions: (transactions: Transaction[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setCurrentFilters: (filters: undefined | Filter[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;

  removeFilter: (filters: Filter | Filter[]) => void;
  validateAndAddFilters: (newFilters: Filter | Filter[]) => void;
}

const useTransactionStore = create<TransactionState>((set) => ({
  allTransactions: [],
  transactions: [],
  currentFilters: undefined,
  loading: true,
  error: "",

  accountNames: [],
  calculatedData: DEFAULT_CALCULATED_DATA,
  dateRangeData: DEFAULT_DATE_RANGE_DATA,

  setAllTransactions: (transactions) =>
    set(() => {
      const accountNames = getAllAccountNames(transactions);
      return {
        allTransactions: transactions,
        accountNames,
      };
    }),

  setTransactions: (transactions) =>
    set((state) => {
      const calculatedData = getCalculatedData(transactions);
      const dateRangeData = getDateRangeData({
        transactions,
        currentFilters: state.currentFilters,
      });

      return {
        transactions,
        calculatedData,
        dateRangeData,
      };
    }),

  setCurrentFilters: (filters) =>
    set((state) => {
      const updatedFilters = validateAndAddFilters(filters, []);
      return { ...state, currentFilters: updatedFilters };
    }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  removeFilter: (filter) =>
    set((state) => {
      const updatedFilters = removeFilters(state.currentFilters, filter);

      let dateRangeData = state.dateRangeData;
      if (filterIsDateRelated(filter)) {
        dateRangeData = getDateRangeData({
          transactions: state.transactions,
          currentFilters: updatedFilters,
        });
      }

      return {
        currentFilters: updatedFilters,
        dateRangeData,
      };
    }),

  validateAndAddFilters: (newFilter) =>
    set((state) => {
      const updatedFilters = validateAndAddFilters(
        state.currentFilters,
        newFilter
      );

      let dateRangeData = state.dateRangeData;
      if (filterIsDateRelated(newFilter)) {
        dateRangeData = getDateRangeData({
          transactions: state.transactions,
          currentFilters: updatedFilters,
        });
      }

      return {
        currentFilters: updatedFilters,
        dateRangeData,
      };
    }),
}));

export default useTransactionStore;
