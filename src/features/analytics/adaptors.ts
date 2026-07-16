import type { AnalyticsData, TimeSeriesPoint, CohortRow, FunnelStep, GeoEntry } from "./types";
import type { RawAnalyticsData } from "./schemas";
import { z } from "zod";
import { rawTimeSeriesPointSchema, rawCohortRowSchema, rawFunnelStepSchema, rawGeoEntrySchema } from "./schemas";

type RawTimeSeriesPoint = z.infer<typeof rawTimeSeriesPointSchema>;
type RawCohortRow = z.infer<typeof rawCohortRowSchema>;
type RawFunnelStep = z.infer<typeof rawFunnelStepSchema>;
type RawGeoEntry = z.infer<typeof rawGeoEntrySchema>;

function timeSeriesFromRaw(raw: RawTimeSeriesPoint): TimeSeriesPoint {
  return { date: raw.date, value: raw.value };
}

function cohortFromRaw(raw: RawCohortRow): CohortRow {
  return { cohort: raw.cohort, size: raw.size, retentionByWeek: raw.retention_by_week };
}

function funnelFromRaw(raw: RawFunnelStep): FunnelStep {
  return { name: raw.name, count: raw.count, percentage: raw.percentage };
}

function geoFromRaw(raw: RawGeoEntry): GeoEntry {
  return { country: raw.country, countryCode: raw.country_code, userCount: raw.user_count, percentage: raw.percentage };
}

export function analyticsDataFromRaw(raw: RawAnalyticsData): AnalyticsData {
  return {
    engagement: raw.engagement.map(timeSeriesFromRaw),
    cohorts: raw.cohorts.map(cohortFromRaw),
    funnel: raw.funnel.map(funnelFromRaw),
    geo: raw.geo.map(geoFromRaw),
    summary: {
      totalUsers: raw.summary.total_users,
      dau: raw.summary.dau,
      wau: raw.summary.wau,
      mau: raw.summary.mau,
      avgSessionMinutes: raw.summary.avg_session_minutes,
    },
  };
}
