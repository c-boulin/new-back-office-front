import { describe, it, expect } from "vitest";
import { tenantDashboardSchema } from "@/features/dashboard/schemas";

describe("tenantDashboardSchema", () => {
  const valid = {
    kpis: {
      activeUsers: { value: 5000, variation: 3.2, series: [{ date: "2026-09-01", count: 5000 }] },
      signups: { value: 120, variation: -1.5, series: [] },
    },
    urgent_actions: [{ type: "reports", count: 12 }],
  };

  it("parses valid dashboard payload", () => {
    expect(() => tenantDashboardSchema.parse(valid)).not.toThrow();
  });

  it("accepts empty kpis and urgent_actions", () => {
    expect(() =>
      tenantDashboardSchema.parse({ kpis: {}, urgent_actions: [] }),
    ).not.toThrow();
  });

  it("rejects payload without urgent_actions (normalize in API layer)", () => {
    expect(() => tenantDashboardSchema.parse({ kpis: {} })).toThrow();
  });

  it("ignores extra fields like compare", () => {
    const withCompare = { ...valid, compare: "previous_period" };
    const result = tenantDashboardSchema.parse(withCompare);
    expect(result.kpis.activeUsers.value).toBe(5000);
  });

  it("rejects kpi with missing variation", () => {
    expect(() =>
      tenantDashboardSchema.parse({
        kpis: { x: { value: 1, series: [] } },
        urgent_actions: [],
      }),
    ).toThrow();
  });
});
