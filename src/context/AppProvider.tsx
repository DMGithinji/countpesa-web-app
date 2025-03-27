import React, { ReactNode } from 'react';
import { BrowserRouter } from "react-router-dom";
import { TransactionDataProvider } from './TransactionDataContext';
import { AIContextProvider } from './AIContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <TransactionDataProvider>
        <AIContextProvider>
          {children}
        </AIContextProvider>
      </TransactionDataProvider>
    </BrowserRouter>
  );
};