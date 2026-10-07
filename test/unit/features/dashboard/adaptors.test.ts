import { describe, it, expect } from "vitest";
import { dashboardFromRaw } from "@/features/dashboard/adaptors";
import { tenantDashboardSchema } from "@/features/dashboard/schemas";
import { dashboardPayload } from "./fixtures";

describe("dashboardFromRaw", () => {
  const result = dashboardFromRaw(tenantDashboardSchema.parse(dashboardPayload));

  it("keeps variation as a ratio", () => {
    expect(result.kpis.activeUsers.value).toBe(1280);
    expect(result.kpis.activeUsers.variation).toBe(-0.041);
    expect(result.kpis.activeUsers.series).toHaveLength(3);
  });

  it("maps compare and urgentActions", () => {
    expect(result.compare).toBe("previous_period");
    expect(result.urgentActions).toEqual([{ type: "reports", count: 7 }]);
  });

  it("maps recentActivity with actor and nullable target", () => {
    expect(result.recentActivity).toHaveLength(2);
    expect(result.recentActivity[0]).toEqual({
      id: "match-1",
      type: "match",
      occurredAt: "2026-10-07T11:55:00Z",
      actor: { id: 1, name: "Alice Martin", initials: "AM" },
      target: { id: 2, name: "Bruno Petit", initials: "BP" },
    });
    expect(result.recentActivity[1].target).toBeNull();
  });
});
