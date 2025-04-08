import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { DefaultErrorFallback, ErrorBoundary } from "@/components/ErrorBoundary";
import { AIContextProvider } from "./AIContext";
import { ThemeProvider } from "./ThemeProvider";
import { RepositoryProvider } from "./RepositoryContext";

interface AppProvidersProps {
  children: ReactNode;
}

const errorFallbackRenderer = (error: Error, reset: () => void) => (
  <DefaultErrorFallback error={error} resetError={reset} />
);

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary
      fallback={errorFallbackRenderer}
      onError={(error, info) => {
        console.error("Application Error:", error, info);
        // Would be nice to add an error reporting service here
      }}
    >
      <ThemeProvider>
        <BrowserRouter>
          <RepositoryProvider>
            <AIContextProvider>{children}</AIContextProvider>
          </RepositoryProvider>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
