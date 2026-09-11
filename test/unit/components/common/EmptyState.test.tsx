import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { EmptyState } from "@/components/common/EmptyState";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("EmptyState", () => {
  it("renders title and description", () => {
    renderWithProviders(
      <EmptyState title="No users" description="Try a different filter." />,
    );
    expect(screen.getByText("No users")).toBeInTheDocument();
    expect(screen.getByText("Try a different filter.")).toBeInTheDocument();
  });

  it("omits description when not provided", () => {
    renderWithProviders(<EmptyState title="Nothing" />);
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });

  it("renders provided action node", () => {
    renderWithProviders(
      <EmptyState title="No data" action={<button>Add</button>} />,
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });
});
