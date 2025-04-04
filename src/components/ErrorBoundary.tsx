import React, { ReactNode } from "react";
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

// This component needs to be a class component because error boundaries require lifecycle methods
class ErrorBoundaryClass extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
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
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

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
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Something went wrong
            </h2>
            <p className="text-money-out mb-4">{error.message}</p>
            <button
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
export const ErrorBoundary: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundaryClass {...props} />;
};

// Hook to create boundary-wrapped components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, "children"> = {}
): React.FC<P> {
  return (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
}

// Custom fallback example
export const DefaultErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
    <Card className="w-full max-w-md p-6 text-center">
      <h2 className="text-2xl font-semibold text-red-700 mb-3">
        Oops! Something just went wrong.
      </h2>
      <p>
        Don't worry, we've been notified about the issue and are working on a
        fix.
      </p>
      <p>You can continue using the rest of the app.</p>
      {process.env.NODE_ENV === "development" && (
        <details className="bg-red-50 p-3 rounded border border-red-200 text-red-800 text-sm overflow-auto mb-2">
          <summary className="cursor-pointer font-medium text-money-out">
            Error details
          </summary>
          <pre className="whitespace-pre-wrap text-left">{error.message}</pre>
        </details>
      )}
      <Button variant={"destructive"} onClick={resetError}>
        Continue browsing...
      </Button>
    </Card>
  </div>
);
