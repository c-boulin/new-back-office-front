import type { RawTenantDashboard } from "./schemas";
import type { TenantDashboard } from "./types";

export function dashboardFromRaw(raw: RawTenantDashboard): TenantDashboard {
  return {
    kpis: Object.fromEntries(
      Object.entries(raw.kpis).map(([key, kpi]) => [key, {
        value: kpi.value,
        variation: kpi.variation,
        series: kpi.series,
      }]),
    ),
    urgentActions: (raw.urgent_actions ?? []).map((a) => ({
      type: a.type,
      count: a.count,
    })),
  };
}
