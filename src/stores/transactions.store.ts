import { CompositeFilter, Filter } from "@/types/Filters";
import { create } from 'zustand';
import { Transaction } from "@/types/Transaction";


// Store interface - minimal version that just holds state
interface TransactionState {
  loading: boolean;
  transactions: Transaction[];
  currentFilters: undefined | Filter | CompositeFilter;
  error: string;

  // Simple setters
  setTransactions: (transactions: Transaction[]) => void;
  setCurrentFilters: (filters: undefined | Filter | CompositeFilter) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
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
  setError: (error) => set({ error })
}));

export default useTransactionStore;