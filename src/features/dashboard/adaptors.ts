import type { DashboardOverview, RecentActivity, StatItem, ActivityItem } from "./types";
import type { RawDashboardOverview, RawActivityItem, RawRecentActivity } from "./schemas";
import { z } from "zod";
import { rawStatItemSchema } from "./schemas";

type RawStatItem = z.infer<typeof rawStatItemSchema>;

function statFromRaw(raw: RawStatItem): StatItem {
  return {
    label: raw.label,
    value: raw.value,
    previousValue: raw.previous_value,
    trendDirection: raw.trend_direction,
    trendLabel: raw.trend_label,
  };
}

function activityFromRaw(raw: RawActivityItem): ActivityItem {
  return {
    id: raw.id,
    actorName: raw.actor_name,
    actorAvatarUrl: raw.actor_avatar_url,
    action: raw.action,
    targetName: raw.target_name,
    occurredAt: raw.occurred_at,
  };
}

export function dashboardOverviewFromRaw(raw: RawDashboardOverview): DashboardOverview {
  return {
    activeUsers: statFromRaw(raw.active_users),
    newMatches: statFromRaw(raw.new_matches),
    openReports: statFromRaw(raw.open_reports),
    sessions: statFromRaw(raw.sessions),
  };
}

export function recentActivityFromRaw(raw: RawRecentActivity): RecentActivity {
  return {
    items: raw.items.map(activityFromRaw),
  };
}
