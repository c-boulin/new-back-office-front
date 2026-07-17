import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { PageHeader } from "@/components/common/PageHeader";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("PageHeader", () => {
  it("renders title as an h1", () => {
    renderWithProviders(<PageHeader title="Users" />);
    expect(screen.getByRole("heading", { level: 1, name: "Users" })).toBeInTheDocument();
  });

  it("renders description and actions when provided", () => {
    renderWithProviders(
      <PageHeader
        title="Users"
        description="Manage tenant users"
        actions={<button>New</button>}
      />,
    );
    expect(screen.getByText("Manage tenant users")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "New" })).toBeInTheDocument();
  });
});
