import React, { ReactNode } from "react";
import { submitData } from "@/lib/feedbackUtils";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const logErrorToFeedback = (error: Error, errorInfo: React.ErrorInfo): void => {
  submitData({
    type: "error",
    message: JSON.stringify({
      name: `${error.name}: ${error.message}`,
      url: typeof window !== "undefined" ? window.location.href : "",
      timestamp: new Date().toISOString(),
      componentStack: errorInfo.componentStack,
      stack: error.stack,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    }),
  });
};

// This component needs to be a class component because error boundaries require lifecycle methods
class ErrorBoundaryClass extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { onError } = this.props;

    if (onError) {
      onError(error, errorInfo);
    }

    logErrorToFeedback(error, errorInfo);

    // eslint-disable-next-line no-console
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    const { children, fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      if (typeof fallback === "function") {
        return fallback(error, this.resetError);
      }

      return (
        fallback || (
          <div className="p-4 border border-red-300 rounded bg-red-50">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-money-out mb-4">{error.message}</p>
            <button
              type="button"
              onClick={this.resetError}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return children;
  }
}

// Functional wrapper for the class component
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorBoundaryClass {...props} />;
}

// Hook to create boundary-wrapped components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, "children"> = {}
): React.FC<P> {
  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  }

  return WithErrorBoundary;
}

// Custom fallback example
export function DefaultErrorFallback({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <Card className="w-full max-w-md p-6 text-center">
        <h2 className="text-2xl font-semibold text-red-700 mb-3">
          Oops! Something just went wrong.
        </h2>
        <p>Don&apos;t worry, we&apos;ve been notified about the issue and are working on a fix.</p>
        <p>You can continue using the rest of the app.</p>
        {process.env.NODE_ENV === "development" && (
          <details className="bg-red-50 p-3 rounded border border-red-200 text-red-800 text-sm overflow-auto mb-2">
            <summary className="cursor-pointer font-medium text-money-out">Error details</summary>
            <pre className="whitespace-pre-wrap text-left">{error.message}</pre>
          </details>
        )}
        <Button variant="destructive" onClick={resetError}>
          Continue browsing...
        </Button>
      </Card>
    </div>
  );
}
