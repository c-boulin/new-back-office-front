import { describe, it, expect } from "vitest";
import { subscriptionsFromRaw } from "@/features/subscriptions/adaptors";
import { subscriptionsOverviewSchema } from "@/features/subscriptions/schemas";

const valid = {
  active_count: 100,
  monthly_recurring_revenue_cents: 100_000,
  currency: "USD",
  churn_rate_pct: 3.2,
  arpu_cents: 1_000,
  plans: [
    {
      id: "p1",
      name: "Pro",
      monthly_price_cents: 999,
      currency: "USD",
      active_count: 50,
      churn_rate_pct: 2,
    },
  ],
  revenue_by_month: [{ month: "2024-01", cents: 100 }],
};

describe("subscriptionsFromRaw", () => {
  it("renames every field", () => {
    const out = subscriptionsFromRaw(valid);
    expect(out.activeCount).toBe(100);
    expect(out.monthlyRecurringRevenueCents).toBe(100_000);
    expect(out.arpuCents).toBe(1_000);
    expect(out.churnRatePct).toBeCloseTo(3.2);
    expect(out.plans[0].monthlyPriceCents).toBe(999);
    expect(out.plans[0].activeCount).toBe(50);
    expect(out.revenueByMonth[0]).toEqual({ month: "2024-01", cents: 100 });
  });
});

describe("subscriptionsOverviewSchema", () => {
  it("parses valid", () => {
    expect(() => subscriptionsOverviewSchema.parse(valid)).not.toThrow();
  });

  it("rejects negative MRR", () => {
    expect(() =>
      subscriptionsOverviewSchema.parse({
        ...valid,
        monthly_recurring_revenue_cents: -1,
      }),
    ).toThrow();
  });
});
