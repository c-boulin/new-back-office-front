import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import { createRng } from "../rng";
import type { RawPlan, RawSubscriber, RawPaginatedSubscribers, RawSubscriptionOverview } from "@/features/subscriptions/schemas";

type Params = Record<string, string | undefined>;

const PLANS: RawPlan[] = [
  { id: "plan_free", name: "Free", tier: "free", price_monthly: 0, price_yearly: 0, currency: "USD", subscriber_count: 0, is_active: true },
  { id: "plan_basic", name: "Basic", tier: "basic", price_monthly: 9.99, price_yearly: 99.99, currency: "USD", subscriber_count: 0, is_active: true },
  { id: "plan_premium", name: "Premium", tier: "premium", price_monthly: 19.99, price_yearly: 199.99, currency: "USD", subscriber_count: 0, is_active: true },
  { id: "plan_vip", name: "VIP", tier: "vip", price_monthly: 49.99, price_yearly: 499.99, currency: "USD", subscriber_count: 0, is_active: true },
];

const STATUSES: RawSubscriber["status"][] = ["active", "active", "active", "cancelled", "expired", "trial"];

function buildSubscribers(tenantId: string): RawSubscriber[] {
  const users = db.usersFor(tenantId).filter((u) => u.is_premium);
  const rng = createRng(tenantId.length * 59 + 37);
  return users.map((user, i) => {
    const plan = PLANS[rng.int(1, PLANS.length - 1)];
    const status = rng.pick(STATUSES);
    const daysAgo = rng.int(10, 365);
    return {
      id: `sub_${tenantId}_${String(i + 1).padStart(4, "0")}`,
      user_id: user.id,
      user_name: user.display_name,
      user_email: user.email,
      plan_name: plan.name,
      plan_tier: plan.tier,
      status,
      started_at: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      expires_at: new Date(Date.now() + rng.int(1, 365) * 86_400_000).toISOString(),
      amount_paid: plan.price_monthly * rng.int(1, 12),
      currency: "USD",
    };
  });
}

const cache: Record<string, RawSubscriber[]> = {};

function getSubscribers(tenantId: string): RawSubscriber[] {
  if (!cache[tenantId]) cache[tenantId] = buildSubscribers(tenantId);
  return cache[tenantId];
}

export function overview(tenantId: string | null): RawSubscriptionOverview {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const subs = getSubscribers(tenantId);
  const active = subs.filter((s) => s.status === "active");
  const plans = PLANS.map((p) => ({
    ...p,
    subscriber_count: subs.filter((s) => s.plan_tier === p.tier && s.status === "active").length,
  }));
  const totalRevenue = subs.reduce((sum, s) => sum + s.amount_paid, 0);
  const churnRate = subs.length > 0 ? subs.filter((s) => s.status === "cancelled").length / subs.length : 0;
  return {
    plans,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    active_subscribers: active.length,
    churn_rate: Math.round(churnRate * 1000) / 1000,
  };
}

export function list(tenantId: string | null, params: Params): RawPaginatedSubscribers {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getSubscribers(tenantId);
  const search = (params.search ?? "").trim().toLowerCase();
  const status = params.status;
  const tier = params.tier;
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = items.filter((item) => {
    if (status && status !== "all" && item.status !== status) return false;
    if (tier && tier !== "all" && item.plan_tier !== tier) return false;
    if (search && !item.user_name.toLowerCase().includes(search) && !item.user_email.toLowerCase().includes(search)) return false;
    return true;
  });

  const start = page * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, page_size: pageSize };
}

export function refund(tenantId: string | null, id: string): RawSubscriber {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getSubscribers(tenantId);
  const item = items.find((s) => s.id === id);
  if (!item) throw new AppError("not_found", "Subscriber not found", 404);
  item.status = "cancelled";
  return item;
}

export function cancel(tenantId: string | null, id: string): RawSubscriber {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getSubscribers(tenantId);
  const item = items.find((s) => s.id === id);
  if (!item) throw new AppError("not_found", "Subscriber not found", 404);
  item.status = "cancelled";
  return item;
}
