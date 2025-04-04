import React, { createContext, useMemo, ReactNode, useContext, useEffect } from 'react';
import useTransactionStore from '@/stores/transactions.store';
import { Transaction } from '@/types/Transaction';
import { Filter } from '@/types/Filters';
import { DateRangeData, getDateRangeData } from '@/lib/getDateRangeData';
import { useLoadInitialTransactions, useTransactions } from '@/hooks/useTransactions';
import { CalculatedData, getCalculatedData } from '@/lib/getCalculatedData';
import { getPeriodAverages } from '@/lib/groupByPeriod';

interface TransactionDataContextType {

  // Derived Data
  dateRangeData: DateRangeData;
  calculatedData: CalculatedData;
  accountsList: string[];
  periodAverages: { [period: string]: {
    moneyInAverage: number;
    moneyOutAverage: number;
  }};

  // Actions
  loadTransactions: () => Promise<void>;
  categorizeTransaction: (trId: string, categoryToSet: string) => Promise<void>;
  getRelatedTransactions: (account: string, category?: string, getAll?: boolean) => Promise<Transaction[]>;
  bulkUpdateTransactions: (updatedTrs: Transaction[]) => Promise<void>;
  validateAndAddFilters: (newFilters: Filter | Filter[]) => void;
  removeFilter: (filter: Filter) => void;
}

// Create context
const TransactionDataContext = createContext<TransactionDataContextType | undefined>(undefined);

// Provider component
export const TransactionDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loading = useTransactionStore(state => state.loading);
  const transactions = useTransactionStore(state => state.transactions);
  const currentFilters = useTransactionStore(state => state.currentFilters);
  const validateAndAddFilters = useTransactionStore(state => state.validateAndAddFilters);
  const removeFilter = useTransactionStore(state => state.removeFilter);

  const { fetchTransactions } = useLoadInitialTransactions();
  const {
    loadTransactions,
    categorizeTransaction,
    getRelatedTransactions,
    bulkUpdateTransactions,
  } = useTransactions();

  // memoize to prevent unnecessary rerenders
  const contextValue = useMemo(() => {
    const start = performance.now();
    const dateRangeData = getDateRangeData({transactions, currentFilters});

    const calculatedData = getCalculatedData(transactions);

    const periodAverages = getPeriodAverages(dateRangeData, calculatedData);

    const accountNames = new Set([
      ...calculatedData.topAccountsReceivedFromByAmt.map(a => a.name),
      ...calculatedData.topAccountsSentToByAmt.map(a => a.name),
    ]).values();

    const accountsList = Array.from(accountNames);
    const end = performance.now();
    console.log('contextValue', Math.round(end - start));
    return {
    // Derived data
    dateRangeData,
    calculatedData,
    accountsList,
    periodAverages,

    // Actions
    loadTransactions,
    categorizeTransaction,
    getRelatedTransactions,
    bulkUpdateTransactions,
    validateAndAddFilters,
    removeFilter,
  }}, [bulkUpdateTransactions, categorizeTransaction, currentFilters, getRelatedTransactions, loadTransactions, removeFilter, transactions, validateAndAddFilters]);

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
