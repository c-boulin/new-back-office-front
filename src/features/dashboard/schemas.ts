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
  type: z.string(),
  count: z.number().int(),
});

export const tenantDashboardSchema = z.object({
  kpis: z.record(z.string(), kpiSchema),
  urgent_actions: z.array(urgentActionSchema),
});

export type RawTenantDashboard = z.infer<typeof tenantDashboardSchema>;
