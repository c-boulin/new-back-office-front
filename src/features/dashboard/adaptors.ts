import type { RawTenantDashboard } from "./schemas";
import type { ActivityActor, TenantDashboard } from "./types";

function actorFromRaw(raw: ActivityActor): ActivityActor {
  return { id: raw.id, name: raw.name, initials: raw.initials };
}

export function dashboardFromRaw(raw: RawTenantDashboard): TenantDashboard {
  return {
    compare: raw.compare,
    kpis: Object.fromEntries(
      Object.entries(raw.kpis).map(([key, kpi]) => [
        key,
        { value: kpi.value, variation: kpi.variation, series: kpi.series },
      ]),
    ),
    urgentActions: raw.urgentActions.map((a) => ({ type: a.type, count: a.count })),
    recentActivity: raw.recentActivity.map((item) => ({
      id: item.id,
      type: item.type,
      occurredAt: item.occurredAt,
      actor: actorFromRaw(item.actor),
      target: item.target ? actorFromRaw(item.target) : null,
    })),
  };
}
