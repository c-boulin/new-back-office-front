import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { renderWithProviders } from "@test/utils/renderWithProviders";

describe("StatCard", () => {
  it("renders label and value", () => {
    renderWithProviders(<StatCard label="Active" value="1,234" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("shows hint and trend when provided", () => {
    renderWithProviders(
      <StatCard
        label="Active"
        value={42}
        hint="Last 7 days"
        trend={{ direction: "up", label: "+8%" }}
        icon={Users}
      />,
    );
    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    expect(screen.getByText("+8%")).toBeInTheDocument();
  });
});
