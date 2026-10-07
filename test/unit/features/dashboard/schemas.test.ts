import { describe, it, expect } from "vitest";
import { tenantDashboardSchema } from "@/features/dashboard/schemas";
import { dashboardPayload } from "./fixtures";

describe("tenantDashboardSchema", () => {
  it("accepts the real camelCase payload", () => {
    const result = tenantDashboardSchema.safeParse(dashboardPayload);
    expect(result.success).toBe(true);
  });

  it("strips undeclared fields such as products", () => {
    const parsed = tenantDashboardSchema.parse(dashboardPayload);
    expect(parsed).not.toHaveProperty("products");
  });

  it("accepts an activity item with a null target", () => {
    const parsed = tenantDashboardSchema.parse(dashboardPayload);
    expect(parsed.recentActivity[1].target).toBeNull();
  });

  it("rejects snake_case urgent_actions", () => {
    const { urgentActions, ...rest } = dashboardPayload;
    const result = tenantDashboardSchema.safeParse({ ...rest, urgent_actions: urgentActions });
    expect(result.success).toBe(false);
  });

  it("rejects snake_case occurred_at", () => {
    const [first] = dashboardPayload.recentActivity;
    const { occurredAt, ...item } = first;
    const result = tenantDashboardSchema.safeParse({
      ...dashboardPayload,
      recentActivity: [{ ...item, occurred_at: occurredAt }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown activity type", () => {
    const [first] = dashboardPayload.recentActivity;
    const result = tenantDashboardSchema.safeParse({
      ...dashboardPayload,
      recentActivity: [{ ...first, type: "like" }],
    });
    expect(result.success).toBe(false);
  });
});
