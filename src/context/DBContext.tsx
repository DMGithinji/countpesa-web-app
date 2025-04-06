import { createContext, useContext, ReactNode, useMemo } from "react";
import { useLocation } from "react-router-dom";
import AnalysisRepository from "@/database/AnalysisRepository";
import CategoryRepository from "@/database/CategoryRepository";
import TransactionRepository from "@/database/TransactionRepository";

interface RepositoryContextType {
  transactionRepository: TransactionRepository;
  categoryRepository: CategoryRepository;
  analysisRepository: AnalysisRepository;
  isDemoMode: boolean;
}

const RepositoryContext = createContext<RepositoryContextType | undefined>(undefined);

export function RepositoryProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isDemoMode = location.pathname.includes('/demo');

  const value = useMemo(() => {
  const transactionRepository = new TransactionRepository(isDemoMode);
  const categoryRepository = new CategoryRepository(isDemoMode);
  const analysisRepository = new AnalysisRepository(isDemoMode);

  return {
    transactionRepository,
    categoryRepository,
    analysisRepository,
    isDemoMode
  };
  }, [isDemoMode]);

  return (
    <RepositoryContext.Provider value={value}>
      {children}
    </RepositoryContext.Provider>
  );
}

// Custom hooks to access repositories
export function useRepositories() {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error("useRepositories must be used within a RepositoryProvider");
  }
  return context;
}

export function useTransactionRepository() {
  return useRepositories().transactionRepository;
}

export function useCategoryRepository() {
  return useRepositories().categoryRepository;
}

export function useAnalysisRepository() {
  return useRepositories().analysisRepository;
}

export function useDemoMode() {
  return useRepositories().isDemoMode;
}