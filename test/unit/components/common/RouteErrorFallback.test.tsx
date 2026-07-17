import { describe, it, expect } from "vitest";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RouteErrorFallback } from "@/components/common/RouteErrorFallback";
import "@/lib/i18n";

function renderRouter(routes: Parameters<typeof createMemoryRouter>[0]) {
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>,
  );
}

describe("RouteErrorFallback", () => {
  it("renders thrown Error message", async () => {
    renderRouter([
      {
        path: "/",
        errorElement: <RouteErrorFallback />,
        loader: () => {
          throw new Error("boom-loader");
        },
        element: <p>never</p>,
      },
    ]);
    expect(await screen.findByText(/boom-loader/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("renders status/statusText for route error responses", async () => {
    renderRouter([
      {
        path: "/",
        errorElement: <RouteErrorFallback />,
        loader: () => {
          throw new Response("nope", { status: 404, statusText: "Not Found" });
        },
        element: <p>never</p>,
      },
    ]);
    expect(await screen.findByText(/404 Not Found/)).toBeInTheDocument();
  });
});
