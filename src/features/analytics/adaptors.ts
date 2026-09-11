import type { AnalyticsOverview } from "./types";
import type { RawAnalyticsOverview } from "./schemas";

export function analyticsFromRaw(raw: RawAnalyticsOverview): AnalyticsOverview {
  return {
    dailyActiveUsers: raw.daily_active_users,
    monthlyActiveUsers: raw.monthly_active_users,
    stickinessRatio: raw.stickiness_ratio,
    retention: raw.retention,
    funnel: raw.funnel,
    activityByHour: raw.activity_by_hour,
  };
}
