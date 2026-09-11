import { z } from "zod";

export const analyticsOverviewSchema = z.object({
  daily_active_users: z.number().int().nonnegative(),
  monthly_active_users: z.number().int().nonnegative(),
  stickiness_ratio: z.number(),
  retention: z.array(z.object({ day: z.number().int(), percentage: z.number() })),
  funnel: z.array(
    z.object({ step: z.string(), count: z.number().int(), conversion: z.number() }),
  ),
  activity_by_hour: z.array(z.object({ hour: z.number().int(), value: z.number() })),
});

export type RawAnalyticsOverview = z.infer<typeof analyticsOverviewSchema>;
