import type { Plan, Subscriber, PaginatedSubscribers, SubscriptionOverview } from "./types";
import type { RawPlan, RawSubscriber, RawPaginatedSubscribers, RawSubscriptionOverview } from "./schemas";

export function planFromRaw(raw: RawPlan): Plan {
  return {
    id: raw.id,
    name: raw.name,
    tier: raw.tier,
    priceMonthly: raw.price_monthly,
    priceYearly: raw.price_yearly,
    currency: raw.currency,
    subscriberCount: raw.subscriber_count,
    isActive: raw.is_active,
  };
}

export function subscriberFromRaw(raw: RawSubscriber): Subscriber {
  return {
    id: raw.id,
    userId: raw.user_id,
    userName: raw.user_name,
    userEmail: raw.user_email,
    planName: raw.plan_name,
    planTier: raw.plan_tier,
    status: raw.status,
    startedAt: raw.started_at,
    expiresAt: raw.expires_at,
    amountPaid: raw.amount_paid,
    currency: raw.currency,
  };
}

export function paginatedSubscribersFromRaw(raw: RawPaginatedSubscribers): PaginatedSubscribers {
  return {
    items: raw.items.map(subscriberFromRaw),
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
  };
}

export function subscriptionOverviewFromRaw(raw: RawSubscriptionOverview): SubscriptionOverview {
  return {
    plans: raw.plans.map(planFromRaw),
    totalRevenue: raw.total_revenue,
    activeSubscribers: raw.active_subscribers,
    churnRate: raw.churn_rate,
  };
}
