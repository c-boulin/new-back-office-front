import type { RawActivityEvent, RawTenantDashboard } from "./schemas";
import type { ActivityEvent, TenantDashboard } from "./types";

function activityFromRaw(raw: RawActivityEvent): ActivityEvent {
  return {
    id: raw.id,
    actorName: raw.actor_name,
    action: raw.action,
    target: raw.target,
    createdAt: raw.created_at,
  };
}

export function dashboardFromRaw(raw: RawTenantDashboard): TenantDashboard {
  return {
    stats: raw.stats,
    engagement: raw.engagement,
    recentActivity: raw.recent_activity.map(activityFromRaw),
  };
}
