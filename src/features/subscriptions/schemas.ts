import { z } from "zod";

export const subscriptionPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  monthly_price_cents: z.number().int().nonnegative(),
  currency: z.string(),
  active_count: z.number().int().nonnegative(),
  churn_rate_pct: z.number(),
});

export const subscriptionsOverviewSchema = z.object({
  active_count: z.number().int().nonnegative(),
  monthly_recurring_revenue_cents: z.number().int().nonnegative(),
  currency: z.string(),
  churn_rate_pct: z.number(),
  arpu_cents: z.number().int().nonnegative(),
  plans: z.array(subscriptionPlanSchema),
  revenue_by_month: z.array(z.object({ month: z.string(), cents: z.number().int() })),
});

export type RawSubscriptionsOverview = z.infer<typeof subscriptionsOverviewSchema>;
export type RawSubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
