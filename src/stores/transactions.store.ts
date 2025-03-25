import { Filter } from "@/types/Filters";
import { create } from 'zustand';
import { Transaction } from "@/types/Transaction";
import { removeFilters, validateAndAddFilters } from "@/lib/manageFilters";


interface TransactionState {
  loading: boolean;
  transactions: Transaction[];
  currentFilters: undefined | Filter[];
  error: string;

  setTransactions: (transactions: Transaction[]) => void;
  setCurrentFilters: (filters: undefined | Filter[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;

  removeFilter: (filters: Filter | Filter[]) => void;
  validateAndAddFilters: (newFilters: Filter | Filter[]) => void;
}

const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  currentFilters: undefined,
  loading: true,
  error: '',

  setTransactions: (transactions) => set({ transactions }),
  setCurrentFilters: (currentFilters) => set({ currentFilters }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  removeFilter: (filter) => set(state => {
    const updatedFilters = removeFilters(state.currentFilters, filter);
    return { ...state, currentFilters: updatedFilters };
  }),

  validateAndAddFilters: (newFilter) => set(state => {
    const updatedFilters = validateAndAddFilters(state.currentFilters, newFilter);
    return { ...state, currentFilters: updatedFilters };
  })

}));

export default useTransactionStore;