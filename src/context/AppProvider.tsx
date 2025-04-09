import { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { DefaultErrorFallback, ErrorBoundary } from "@/components/ErrorBoundary";
import { submitData } from "@/lib/feedbackUtils";
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
        submitData({
          type: "error",
          message: JSON.stringify({
            name: `Application Error`,
            error,
            info,
            timestamp: new Date().toISOString(),
          }),
        });
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
