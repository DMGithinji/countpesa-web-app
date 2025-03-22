// Contains the provider that consolidates all transaction-related logic
import React, { createContext, useMemo, ReactNode, useContext, useEffect } from 'react';
import useTransactionStore from '@/stores/transactions.store';
import { Transaction } from '@/types/Transaction';
import { CompositeFilter, Filter } from '@/types/Filters';
import { DateRangeData, getDateRangeData } from '@/lib/getDateRangeData';
import { useLoadInitialTransactions, useTransactions } from '@/hooks/useTransactions';
import { CalculatedData, getCalculatedData } from '@/lib/getCalculatedData';

interface TransactionDataContextType {
  // Raw data
  transactions: Transaction[];
  currentFilters: Filter | CompositeFilter | undefined;

  dateRangeData: DateRangeData;
  calculatedData: CalculatedData;

  // Actions
  loadTransactions: () => Promise<void>;
  setCurrentFilters: (filters: Filter | CompositeFilter | undefined) => void;
  categorizeTransaction: (trId: string, categoryToSet: string) => Promise<void>;
  getRelatedTransactions: (account: string, category?: string) => Promise<Transaction[]>
  bulkUpdateTransactions: (updatedTrs: Transaction[]) => Promise<void>
}

// Create context
const TransactionDataContext = createContext<TransactionDataContextType | undefined>(undefined);

// Provider component
export const TransactionDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loading = useTransactionStore(state => state.loading);
  const transactions = useTransactionStore(state => state.transactions);
  const currentFilters = useTransactionStore(state => state.currentFilters);

  const { fetchTransactions } = useLoadInitialTransactions();
  const {
    loadTransactions,
    setCurrentFilters,
    categorizeTransaction,
    getRelatedTransactions,
    bulkUpdateTransactions,
  } = useTransactions();

  const calculatedData = getCalculatedData(transactions);
  const dateRangeData = getDateRangeData({transactions, currentFilters});

  // memoize to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    // Raw data
    transactions,
    currentFilters,

    // Derived data
    dateRangeData,
    calculatedData,

    // Actions
    loadTransactions,
    setCurrentFilters,
    categorizeTransaction,
    getRelatedTransactions,
    bulkUpdateTransactions,
  }), [bulkUpdateTransactions, calculatedData, categorizeTransaction, currentFilters, dateRangeData, getRelatedTransactions, loadTransactions, setCurrentFilters, transactions]);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (loading) return;
    loadTransactions();
  }, [loadTransactions, loading]);


  return (
    <TransactionDataContext.Provider value={contextValue}>
      {children}
    </TransactionDataContext.Provider>
  );
};

export function useTransactionContext() {
  const context = useContext(TransactionDataContext);
  if (context === undefined) {
    throw new Error('useTransactionContext must be used within a TransactionDataProvider');
  }
  return context;
}
