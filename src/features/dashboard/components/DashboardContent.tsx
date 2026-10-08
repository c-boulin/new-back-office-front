import { useSuspenseQuery } from "@tanstack/react-query";
import { getTenantDashboard } from "@/features/dashboard/api";
import { chartSeries } from "@/features/dashboard/format";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { DashboardKpiRow } from "./DashboardKpiRow";
import { EngagementChart } from "./EngagementChart";
import { RecentActivityList } from "./RecentActivityList";

export function DashboardContent() {
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "dashboard"],
    queryFn: getTenantDashboard,
  });

  const series = chartSeries(data.kpis);

  return (
    <>
      <DashboardKpiRow kpis={data.kpis} />
      <div className="grid gap-4 lg:grid-cols-3">
        <EngagementChart series={series} className="lg:col-span-2" />
        <RecentActivityList items={data.recentActivity} fitRowHeight={series.length > 0} />
      </div>
    </>
  );
}
