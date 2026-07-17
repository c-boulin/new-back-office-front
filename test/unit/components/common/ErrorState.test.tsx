import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorState } from "@/components/common/ErrorState";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("ErrorState", () => {
  it("has role alert for assistive tech", () => {
    renderWithProviders(<ErrorState />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders provided title and description", () => {
    renderWithProviders(<ErrorState title="Boom" description="Fetch failed" />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
    expect(screen.getByText("Fetch failed")).toBeInTheDocument();
  });

  it("renders a retry button that calls onRetry", async () => {
    const onRetry = vi.fn();
    renderWithProviders(<ErrorState onRetry={onRetry} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("hides the retry button when onRetry not provided", () => {
    renderWithProviders(<ErrorState />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
