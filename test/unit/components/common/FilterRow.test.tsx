import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterRow } from "@/components/common/FilterRow";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("FilterRow", () => {
  it("renders children and no reset button by default", () => {
    renderWithProviders(
      <FilterRow>
        <span>filter-child</span>
      </FilterRow>,
    );
    expect(screen.getByText("filter-child")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();
  });

  it("renders reset button and calls onReset when clicked", async () => {
    const onReset = vi.fn();
    renderWithProviders(
      <FilterRow onReset={onReset}>
        <span>filter-child</span>
      </FilterRow>,
    );
    await userEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
