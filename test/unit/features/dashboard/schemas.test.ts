import { describe, it, expect } from "vitest";
import {
  activityEventSchema,
  dashboardStatSchema,
  tenantDashboardSchema,
} from "@/features/dashboard/schemas";

describe("activityEventSchema", () => {
  it("rejects unknown action", () => {
    expect(() =>
      activityEventSchema.parse({
        id: "a",
        actor_name: "A",
        action: "burp",
        target: "t",
        created_at: "x",
      }),
    ).toThrow();
  });
});

describe("dashboardStatSchema", () => {
  it("rejects unknown trend direction", () => {
    expect(() =>
      dashboardStatSchema.parse({
        id: "s",
        label: "x",
        value: 1,
        formatted: "1",
        hint: "",
        trend: { direction: "sideways", label: "" },
      }),
    ).toThrow();
  });
});

describe("tenantDashboardSchema", () => {
  it("parses a valid dashboard", () => {
    expect(() =>
      tenantDashboardSchema.parse({
        stats: [],
        engagement: [],
        recent_activity: [],
      }),
    ).not.toThrow();
  });
});
