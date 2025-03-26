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
  assessmentMode: AssessmentMode;
  selectAssessmentMode: (mode: AssessmentMode) => void;
}

const useSidepanelStore = create<SidepanelState>((set) => ({
  mode: SidepanelMode.Closed,
  setMode: (mode) => set({ mode }),

  transactionsData: undefined,
  setTransactionsData: (data) => set({ transactionsData: data }),

  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),

  assessmentMode: AssessmentMode.SERIOUS,
  selectAssessmentMode: (mode) => set({ assessmentMode: mode }),
}));

export default useSidepanelStore;
