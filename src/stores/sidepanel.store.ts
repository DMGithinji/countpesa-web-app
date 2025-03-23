import { create } from 'zustand';
import { TransactionSummary } from '@/lib/groupByField';
import { AssessmentMode } from '@/types/PromptTemplate';

export enum SidepanelMode {
  Closed = 'Closed',
  Categories = 'Categories',
  Transactions = 'Transactions',
}

interface SidepanelState {
  mode: SidepanelMode;
  setMode: (mode: SidepanelMode) => void;

  transactionsData: TransactionSummary | undefined;
  setTransactionsData: (data: TransactionSummary) => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  assessmentMode: AssessmentMode;
  selectAssessmentMode: (mode: AssessmentMode) => void;
}

// Create the minimal Zustand store
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
