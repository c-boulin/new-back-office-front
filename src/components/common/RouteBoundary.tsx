import { Component, Suspense, type ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

type ErrorBoundaryProps = {
  onReset: () => void;
  fallback: (props: { error: Error; reset: () => void }) => ReactNode;
  children: ReactNode;
};

type ErrorBoundaryState = { error: Error | null };

class QueryErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error) {
    console.error("[RouteBoundary]", error);
  }

  reset = () => {
    this.props.onReset();
    this.setState({ error: null });
  };

  override render() {
    if (this.state.error) {
      return this.props.fallback({ error: this.state.error, reset: this.reset });
    }
    return this.props.children;
  }
}

export type RouteBoundaryProps = {
  children: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: (props: { error: Error; reset: () => void }) => ReactNode;
};

export function RouteBoundary({
  children,
  loadingFallback,
  errorFallback,
}: RouteBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <QueryErrorBoundary
          onReset={reset}
          fallback={
            errorFallback ??
            (({ error, reset: retry }) => (
              <ErrorState description={error.message} onRetry={retry} />
            ))
          }
        >
          <Suspense fallback={loadingFallback ?? <LoadingState />}>{children}</Suspense>
        </QueryErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
