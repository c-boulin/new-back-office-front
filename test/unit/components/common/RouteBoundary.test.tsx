import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSuspenseQuery, useQueryErrorResetBoundary } from "@tanstack/react-query";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { renderWithProviders } from "@test/utils/renderWithProviders";

function SuccessChild() {
  const { data } = useSuspenseQuery({
    queryKey: ["ok"],
    queryFn: async () => "ready",
  });
  return <p>{data}</p>;
}

describe("RouteBoundary", () => {
  it("renders content on success", async () => {
    renderWithProviders(
      <RouteBoundary>
        <SuccessChild />
      </RouteBoundary>,
    );
    expect(await screen.findByText("ready")).toBeInTheDocument();
  });

  it("shows the loading fallback while suspending", () => {
    function SlowChild() {
      useSuspenseQuery({
        queryKey: ["slow"],
        queryFn: () => new Promise<string>(() => {}),
      });
      return <p>never</p>;
    }
    renderWithProviders(
      <RouteBoundary loadingFallback={<span>loading-slot</span>}>
        <SlowChild />
      </RouteBoundary>,
    );
    expect(screen.getByText("loading-slot")).toBeInTheDocument();
  });

  it("renders ErrorState on thrown error and retries via reset", async () => {
    const queryFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce("recovered");

    function FlakyChild() {
      const { data } = useSuspenseQuery({
        queryKey: ["flaky"],
        queryFn,
        retry: false,
      });
      return <p>{data}</p>;
    }

    function ProbeReset() {
      const { reset } = useQueryErrorResetBoundary();
      return <button onClick={reset}>manual-reset</button>;
    }

    renderWithProviders(
      <>
        <ProbeReset />
        <RouteBoundary>
          <FlakyChild />
        </RouteBoundary>
      </>,
    );

    await screen.findByRole("alert");
    const retryBtn = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(retryBtn);
    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    expect(await screen.findByText("recovered")).toBeInTheDocument();
  });
});
