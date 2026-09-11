import { describe, it, expect } from "vitest";
import { analyticsFromRaw } from "@/features/analytics/adaptors";

describe("analyticsFromRaw", () => {
  it("renames snake_case fields", () => {
    const out = analyticsFromRaw({
      daily_active_users: 100,
      monthly_active_users: 1000,
      stickiness_ratio: 0.1,
      retention: [{ day: 1, percentage: 90 }],
      funnel: [{ step: "signup", count: 100, conversion: 1 }],
      activity_by_hour: [{ hour: 0, value: 5 }],
    });
    expect(out.dailyActiveUsers).toBe(100);
    expect(out.monthlyActiveUsers).toBe(1000);
    expect(out.stickinessRatio).toBeCloseTo(0.1);
    expect(out.retention).toHaveLength(1);
    expect(out.activityByHour[0].hour).toBe(0);
  });
});
