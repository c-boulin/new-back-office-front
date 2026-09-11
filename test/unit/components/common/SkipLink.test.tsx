import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { SkipLink } from "@/components/common/SkipLink";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("SkipLink", () => {
  it("renders an anchor targeting the given id", () => {
    renderWithProviders(<SkipLink label="Skip to content" targetId="main" />);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main");
  });

  it("defaults targetId to 'main'", () => {
    renderWithProviders(<SkipLink label="Skip" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#main");
  });
});
