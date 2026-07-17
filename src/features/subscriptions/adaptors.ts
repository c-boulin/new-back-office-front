import type { SubscriptionPlan, SubscriptionsOverview } from "./types";
import type { RawSubscriptionPlan, RawSubscriptionsOverview } from "./schemas";

function planFromRaw(raw: RawSubscriptionPlan): SubscriptionPlan {
  return {
    id: raw.id,
    name: raw.name,
    monthlyPriceCents: raw.monthly_price_cents,
    currency: raw.currency,
    activeCount: raw.active_count,
    churnRatePct: raw.churn_rate_pct,
  };
}

export function subscriptionsFromRaw(raw: RawSubscriptionsOverview): SubscriptionsOverview {
  return {
    activeCount: raw.active_count,
    monthlyRecurringRevenueCents: raw.monthly_recurring_revenue_cents,
    currency: raw.currency,
    churnRatePct: raw.churn_rate_pct,
    arpuCents: raw.arpu_cents,
    plans: raw.plans.map(planFromRaw),
    revenueByMonth: raw.revenue_by_month,
  };
}
