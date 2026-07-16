import { z } from "zod";

export const rawPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.enum(["free", "basic", "premium", "vip"]),
  price_monthly: z.number(),
  price_yearly: z.number(),
  currency: z.string(),
  subscriber_count: z.number().int().nonnegative(),
  is_active: z.boolean(),
});

export const rawSubscriberSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  user_name: z.string(),
  user_email: z.string(),
  plan_name: z.string(),
  plan_tier: z.enum(["free", "basic", "premium", "vip"]),
  status: z.enum(["active", "cancelled", "expired", "trial"]),
  started_at: z.string(),
  expires_at: z.string(),
  amount_paid: z.number(),
  currency: z.string(),
});

export const rawPaginatedSubscribersSchema = z.object({
  items: z.array(rawSubscriberSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export const rawSubscriptionOverviewSchema = z.object({
  plans: z.array(rawPlanSchema),
  total_revenue: z.number(),
  active_subscribers: z.number().int().nonnegative(),
  churn_rate: z.number(),
});

export type RawPlan = z.infer<typeof rawPlanSchema>;
export type RawSubscriber = z.infer<typeof rawSubscriberSchema>;
export type RawPaginatedSubscribers = z.infer<typeof rawPaginatedSubscribersSchema>;
export type RawSubscriptionOverview = z.infer<typeof rawSubscriptionOverviewSchema>;
