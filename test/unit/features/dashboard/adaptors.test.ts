import { describe, it, expect } from "vitest";
import { dashboardFromRaw } from "@/features/dashboard/adaptors";

describe("dashboardFromRaw", () => {
  it("maps kpis and urgent_actions", () => {
    const raw = {
      kpis: {
        activeUsers: {
          value: 5000,
          variation: 3.2,
          series: [{ date: "2026-09-01", count: 5000 }],
        },
      },
      urgent_actions: [
        { type: "reports", count: 12 },
        { type: "photos", count: 3 },
      ],
    };
    const result = dashboardFromRaw(raw);

    expect(result.kpis.activeUsers.value).toBe(5000);
    expect(result.kpis.activeUsers.variation).toBe(3.2);
    expect(result.kpis.activeUsers.series).toHaveLength(1);

    expect(result.urgentActions).toHaveLength(2);
    expect(result.urgentActions[0]).toEqual({ type: "reports", count: 12 });
    expect(result.urgentActions[1]).toEqual({ type: "photos", count: 3 });
  });

  it("handles empty kpis and actions", () => {
    const result = dashboardFromRaw({ kpis: {}, urgent_actions: [] });
    expect(Object.keys(result.kpis)).toHaveLength(0);
    expect(result.urgentActions).toHaveLength(0);
  });
});
