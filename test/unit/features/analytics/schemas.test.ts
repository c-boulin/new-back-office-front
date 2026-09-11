import { describe, it, expect } from "vitest";
import { analyticsOverviewSchema } from "@/features/analytics/schemas";

describe("analyticsOverviewSchema", () => {
  it("parses valid", () => {
    expect(() =>
      analyticsOverviewSchema.parse({
        daily_active_users: 1,
        monthly_active_users: 2,
        stickiness_ratio: 0.5,
        retention: [{ day: 1, percentage: 90 }],
        funnel: [{ step: "signup", count: 1, conversion: 1 }],
        activity_by_hour: [{ hour: 0, value: 1 }],
      }),
    ).not.toThrow();
  });

  it("rejects negative counts", () => {
    expect(() =>
      analyticsOverviewSchema.parse({
        daily_active_users: -1,
        monthly_active_users: 0,
        stickiness_ratio: 0,
        retention: [],
        funnel: [],
        activity_by_hour: [],
      }),
    ).toThrow();
  });
});
