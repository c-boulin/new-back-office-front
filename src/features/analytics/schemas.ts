import { z } from "zod";

export const rawTimeSeriesPointSchema = z.object({
  date: z.string(),
  value: z.number(),
});

export const rawCohortRowSchema = z.object({
  cohort: z.string(),
  size: z.number().int().nonnegative(),
  retention_by_week: z.array(z.number()),
});

export const rawFunnelStepSchema = z.object({
  name: z.string(),
  count: z.number().int().nonnegative(),
  percentage: z.number(),
});

export const rawGeoEntrySchema = z.object({
  country: z.string(),
  country_code: z.string(),
  user_count: z.number().int().nonnegative(),
  percentage: z.number(),
});

export const rawAnalyticsSummarySchema = z.object({
  total_users: z.number().int().nonnegative(),
  dau: z.number().int().nonnegative(),
  wau: z.number().int().nonnegative(),
  mau: z.number().int().nonnegative(),
  avg_session_minutes: z.number(),
});

export const rawAnalyticsDataSchema = z.object({
  engagement: z.array(rawTimeSeriesPointSchema),
  cohorts: z.array(rawCohortRowSchema),
  funnel: z.array(rawFunnelStepSchema),
  geo: z.array(rawGeoEntrySchema),
  summary: rawAnalyticsSummarySchema,
});

export type RawAnalyticsData = z.infer<typeof rawAnalyticsDataSchema>;
