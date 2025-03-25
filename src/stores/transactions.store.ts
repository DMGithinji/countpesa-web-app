import { Filter } from "@/types/Filters";
import { create } from 'zustand';
import { Transaction } from "@/types/Transaction";
import { removeFilters, validateAndAddFilters } from "@/lib/manageFilters";


// Store interface - minimal version that just holds state
interface TransactionState {
  loading: boolean;
  transactions: Transaction[];
  currentFilters: undefined | Filter[];
  error: string;

  // Simple setters
  setTransactions: (transactions: Transaction[]) => void;
  setCurrentFilters: (filters: undefined | Filter[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;

  removeFilter: (filters: Filter | Filter[]) => void;
  validateAndAddFilters: (newFilters: Filter | Filter[]) => void;
}

// Create the minimal Zustand store
const useTransactionStore = create<TransactionState>((set) => ({
  // Initial state
  transactions: [],
  currentFilters: undefined,
  loading: true,
  error: '',

  // Simple setters
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
    console.log({updatedFilters});
    return { ...state, currentFilters: updatedFilters };
  })

}));

export default useTransactionStore;