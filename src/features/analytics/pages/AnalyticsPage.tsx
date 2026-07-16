import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Users, Activity, CalendarDays, ChartBar as BarChart3, Clock } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getAnalytics } from "../api";
import type { AnalyticsQuery } from "../types";
import { AnalyticsRangePicker } from "../components/AnalyticsRangePicker";
import { EngagementChart } from "../components/EngagementChart";
import { FunnelCard } from "../components/FunnelCard";
import { GeoCard } from "../components/GeoCard";
import { CohortTable } from "../components/CohortTable";

export function AnalyticsPage() {
  const { t } = useTranslation("analytics");
  const [range, setRange] = useState<AnalyticsQuery["range"]>("30d");

  const analyticsQuery = useQuery({
    queryKey: ["analytics", range],
    queryFn: () => getAnalytics({ range }),
  });

  // Loading state
  if (analyticsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={<AnalyticsRangePicker value={range} onChange={setRange} />}
        />
        <LoadingState rows={6} />
      </div>
    );
  }

  // Error state
  if (analyticsQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={<AnalyticsRangePicker value={range} onChange={setRange} />}
        />
        <ErrorState
          title={t("empty.title")}
          description={t("empty.description")}
          onRetry={() => analyticsQuery.refetch()}
        />
      </div>
    );
  }

  const data = analyticsQuery.data;

  // Empty state (no data at all)
  if (!data || (data.engagement.length === 0 && data.cohorts.length === 0)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={t("title")}
          description={t("description")}
          actions={<AnalyticsRangePicker value={range} onChange={setRange} />}
        />
        <EmptyState
          title={t("empty.title")}
          description={t("empty.description")}
          icon={BarChart3}
        />
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      {/* Header + Range Picker */}
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<AnalyticsRangePicker value={range} onChange={setRange} />}
      />

      {/* Summary Stats Row: 2-col mobile, 3-col tablet, 5-col desktop */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label={t("summary.totalUsers")}
          value={summary.totalUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label={t("summary.dau")}
          value={summary.dau.toLocaleString()}
          icon={Activity}
        />
        <StatCard
          label={t("summary.wau")}
          value={summary.wau.toLocaleString()}
          icon={CalendarDays}
        />
        <StatCard
          label={t("summary.mau")}
          value={summary.mau.toLocaleString()}
          icon={BarChart3}
        />
        <StatCard
          label={t("summary.avgSession")}
          value={`${summary.avgSessionMinutes.toFixed(1)}m`}
          icon={Clock}
        />
      </div>

      {/* Content Grid:
          Mobile: stacked (1 col)
          Tablet: 2-col grid
          Desktop: 3-col grid (engagement spans 2, funnel 1, geo 1, cohort full width)
      */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Engagement Chart - spans 2 cols on desktop */}
        <Card className="md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("engagement.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <EngagementChart data={data.engagement} />
          </CardContent>
        </Card>

        {/* Funnel - 1 col */}
        <FunnelCard steps={data.funnel} />

        {/* Geo - 1 col */}
        <GeoCard entries={data.geo} />

        {/* Cohort Table - full width */}
        <div className="md:col-span-2 lg:col-span-3">
          <CohortTable cohorts={data.cohorts} />
        </div>
      </div>
    </div>
  );
}
