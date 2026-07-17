import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { LoadingState, LoadingCards } from "@/components/common/LoadingState";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("LoadingState", () => {
  it("uses status role with aria-busy and sr-only label", () => {
    renderWithProviders(<LoadingState rows={2} />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });
});

describe("LoadingCards", () => {
  it("is a live status region", () => {
    renderWithProviders(<LoadingCards count={3} />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
  });
});
