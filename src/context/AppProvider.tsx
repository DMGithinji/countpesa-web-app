import React, { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { AIContextProvider } from "./AIContext";
import {
  DefaultErrorFallback,
  ErrorBoundary,
} from "@/components/ErrorBoundary";
import { ThemeProvider } from "./ThemeProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary
      fallback={(error, reset) => (
        <DefaultErrorFallback error={error} resetError={reset} />
      )}
      onError={(error, info) => {
        console.error("Application Error:", error, info);
        // Would be nice to add an error reporting service here
      }}
    >
      <ThemeProvider>
        <BrowserRouter>
          <AIContextProvider>{children}</AIContextProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};
