import { describe, it, expect } from "vitest";
import { Users } from "lucide-react";
import { screen } from "@testing-library/react";
import { PlaceholderPage } from "@/components/common/PlaceholderPage";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("PlaceholderPage", () => {
  it("renders header and empty state together", () => {
    renderWithProviders(
      <PlaceholderPage
        title="Reports"
        description="Coming soon"
        emptyTitle="Nothing yet"
        emptyDescription="Check back later"
        icon={Users}
        actions={<button>Do it</button>}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Reports" })).toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
    expect(screen.getByText("Check back later")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Do it" })).toBeInTheDocument();
  });
});
