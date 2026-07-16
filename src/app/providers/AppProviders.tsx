import type { ReactNode } from "react";
import { Suspense } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/sonner";
import { RootErrorBoundary } from "@/app/RootErrorBoundary";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              <Suspense fallback={null}>{children}</Suspense>
              <Toaster />
              <ReactQueryDevtools initialIsOpen={false} />
            </TooltipProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}
