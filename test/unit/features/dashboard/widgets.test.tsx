import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import { DashboardKpiRow } from "@/features/dashboard/components/DashboardKpiRow";
import { EngagementChart } from "@/features/dashboard/components/EngagementChart";
import { RecentActivityList } from "@/features/dashboard/components/RecentActivityList";
import { dashboardFromRaw } from "@/features/dashboard/adaptors";
import { chartSeries } from "@/features/dashboard/format";
import { tenantDashboardSchema } from "@/features/dashboard/schemas";
import { dashboardPayload } from "./fixtures";

const dashboard = dashboardFromRaw(tenantDashboardSchema.parse(dashboardPayload));

describe("DashboardKpiRow", () => {
  it("renders the four KPI cards in order without signups", () => {
    renderWithProviders(<DashboardKpiRow kpis={dashboard.kpis} />);

    const labels = ["Active users", "New matches", "Reports open", "Sessions"];
    const positions = labels.map((label) => {
      const node = screen.getByText(label);
      return Array.from(document.body.querySelectorAll("*")).indexOf(node);
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(screen.queryByText("Signups")).not.toBeInTheDocument();
  });

  it("formats variation as ratio times 100", () => {
    renderWithProviders(<DashboardKpiRow kpis={dashboard.kpis} />);

    expect(screen.getByText("-4.1%")).toBeInTheDocument();
    expect(screen.getByText("+5.3%")).toBeInTheDocument();
    expect(screen.getByText("+12.0%")).toBeInTheDocument();
    expect(screen.getByText("No change")).toBeInTheDocument();
  });

  it("shows the 7-day hints", () => {
    renderWithProviders(<DashboardKpiRow kpis={dashboard.kpis} />);

    expect(screen.getByText("Last 7 days")).toBeInTheDocument();
    expect(screen.getAllByText("Rolling 7 days")).toHaveLength(2);
    expect(screen.getByText("Requires attention")).toBeInTheDocument();
  });
});

describe("EngagementChart", () => {
  it("draws one bar per activeUsers.series point", () => {
    renderWithProviders(<EngagementChart series={chartSeries(dashboard.kpis)} />);

    const chart = screen.getByRole("list", { name: "Engagement over time" });
    const bars = within(chart).getAllByRole("listitem");
    expect(bars).toHaveLength(3);
    expect(bars[1]).toHaveAttribute("title", "2026-09-30: 210");
  });

  it("renders nothing when the series is empty", () => {
    const { container } = renderWithProviders(<EngagementChart series={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText("Engagement over time")).not.toBeInTheDocument();
  });
});

describe("RecentActivityList", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-07T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders initials, sentences and relative times", () => {
    renderWithProviders(<RecentActivityList items={dashboard.recentActivity} />);

    expect(screen.getByText("AM")).toBeInTheDocument();
    expect(screen.getByText("Alice Martin matched with Bruno Petit")).toBeInTheDocument();
    expect(screen.getByText("Chloe Durand signed up")).toBeInTheDocument();
    expect(screen.getByText("5 minutes ago")).toBeInTheDocument();
    expect(screen.getByText("about 2 hours ago")).toBeInTheDocument();
  });

  it("omits the target part when target is null", () => {
    const [first] = dashboard.recentActivity;
    renderWithProviders(
      <RecentActivityList items={[{ ...first, type: "report", target: null }]} />,
    );

    expect(screen.getByText("Alice Martin filed a report")).toBeInTheDocument();
    expect(screen.queryByText(/Bruno Petit/)).not.toBeInTheDocument();
  });

  it("shows the empty state when there is no activity", () => {
    renderWithProviders(<RecentActivityList items={[]} />);

    expect(screen.getByText("No recent activity")).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
