import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "@/components/common/FilterBar";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("FilterBar", () => {
  it("emits onSearchChange when typing", async () => {
    const onSearchChange = vi.fn();
    renderWithProviders(
      <FilterBar
        search=""
        onSearchChange={onSearchChange}
        searchPlaceholder="Search users"
      />,
    );
    await userEvent.type(screen.getByLabelText("Search users"), "a");
    expect(onSearchChange).toHaveBeenLastCalledWith("a");
  });

  it("renders reset button when onReset is provided and calls it", async () => {
    const onReset = vi.fn();
    renderWithProviders(
      <FilterBar
        search=""
        onSearchChange={() => {}}
        searchPlaceholder="s"
        onReset={onReset}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("hides reset button when onReset is not provided", () => {
    renderWithProviders(
      <FilterBar search="" onSearchChange={() => {}} searchPlaceholder="s" />,
    );
    expect(screen.queryByRole("button", { name: /reset/i })).not.toBeInTheDocument();
  });

  it("renders children as extra filters", () => {
    renderWithProviders(
      <FilterBar search="" onSearchChange={() => {}} searchPlaceholder="s">
        <button>Status</button>
      </FilterBar>,
    );
    expect(screen.getByRole("button", { name: "Status" })).toBeInTheDocument();
  });
});
