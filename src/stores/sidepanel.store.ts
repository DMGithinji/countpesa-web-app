import { create } from 'zustand';
import { Transaction } from '@/types/Transaction';
import { AssessmentMode } from '@/types/AITools';

export enum SidepanelMode {
  Closed = 'Closed',
  Categories = 'Categories',
  Transactions = 'Transactions',
  Filters = 'Filters',
  ChatPesa = 'ChatPesa',
}

export interface SidepanelTransactions {
  name: string;
  transactions: Transaction[] | undefined;
}

interface SidepanelState {
  mode: SidepanelMode;
  setMode: (mode: SidepanelMode) => void;

  transactionsData: SidepanelTransactions | undefined;
  setTransactionsData: (data: SidepanelTransactions) => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const useSidepanelStore = create<SidepanelState>((set) => ({
  mode: SidepanelMode.Closed,
  setMode: (mode) => set({ mode }),

  transactionsData: undefined,
  setTransactionsData: (data) => set({ transactionsData: data }),

  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
}));

export default useSidepanelStore;
