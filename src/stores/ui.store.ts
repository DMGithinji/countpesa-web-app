import { create } from 'zustand';
import { Transaction } from '@/types/Transaction';

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

interface UiState {
  sidepanelMode: SidepanelMode;
  setSidepanelMode: (mode: SidepanelMode) => void;

  sidepanelTransactions: SidepanelTransactions | undefined;
  setSidepanelTransactions: (data: SidepanelTransactions) => void;

  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

const useUiStore = create<UiState>((set) => ({
  sidepanelMode: SidepanelMode.Closed,
  setSidepanelMode: (sidepanelMode) => set({ sidepanelMode }),

  sidepanelTransactions: undefined,
  setSidepanelTransactions: (sidepanelTransactions) => set({ sidepanelTransactions }),

  drawerOpen: false,
  setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
}));

export default useUiStore;
