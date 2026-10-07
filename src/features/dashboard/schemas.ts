import { z } from "zod";

const dailyCountSchema = z.object({
  date: z.string(),
  count: z.number().int(),
});

const kpiSchema = z.object({
  value: z.number(),
  variation: z.number(),
  series: z.array(dailyCountSchema),
});

const urgentActionSchema = z.object({
  type: z.enum(["reports", "photos", "stories"]),
  count: z.number().int(),
});

const activityActorSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  initials: z.string(),
});

const recentActivityItemSchema = z.object({
  id: z.string(),
  type: z.enum(["signup", "match", "message", "verified", "report"]),
  occurredAt: z.string().datetime({ offset: true }),
  actor: activityActorSchema,
  target: activityActorSchema.nullable(),
});

export const tenantDashboardSchema = z.object({
  compare: z.enum(["previous_period", "same_weekday", "none"]),
  kpis: z.record(z.string(), kpiSchema),
  urgentActions: z.array(urgentActionSchema),
  recentActivity: z.array(recentActivityItemSchema),
});

export type RawTenantDashboard = z.infer<typeof tenantDashboardSchema>;
