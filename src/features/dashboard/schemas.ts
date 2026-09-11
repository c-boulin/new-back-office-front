import { z } from "zod";

export const statTrendSchema = z.object({
  direction: z.enum(["up", "down", "flat"]),
  label: z.string(),
});

export const dashboardStatSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.number(),
  formatted: z.string(),
  hint: z.string(),
  trend: statTrendSchema,
});

export const activityEventSchema = z.object({
  id: z.string(),
  actor_name: z.string(),
  action: z.enum(["match", "message", "report", "signup", "verify", "ban"]),
  target: z.string(),
  created_at: z.string(),
});

export const tenantDashboardSchema = z.object({
  stats: z.array(dashboardStatSchema),
  engagement: z.array(z.object({ label: z.string(), value: z.number() })),
  recent_activity: z.array(activityEventSchema),
});

export type RawTenantDashboard = z.infer<typeof tenantDashboardSchema>;
export type RawActivityEvent = z.infer<typeof activityEventSchema>;
