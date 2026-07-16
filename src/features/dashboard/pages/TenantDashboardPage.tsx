import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Activity, Flag, Heart, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { getDashboardOverview, getRecentActivity } from "@/features/dashboard/api";
import type { DashboardOverview, StatItem } from "@/features/dashboard/types";
import { ActivityFeed } from "../components/ActivityFeed";

type StatConfig = {
  key: keyof DashboardOverview;
  icon: LucideIcon;
};

const statConfigs: StatConfig[] = [
  { key: "activeUsers", icon: Users },
  { key: "newMatches", icon: Heart },
  { key: "openReports", icon: Flag },
  { key: "sessions", icon: Activity },
];

function formatStat(stat: StatItem): string {
  return stat.value.toLocaleString();
}

export function TenantDashboardPage() {
  const { t } = useTranslation("dashboard");
  const { membership } = useActiveTenant();

  const overviewQuery = useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: getDashboardOverview,
  });

  const activityQuery = useQuery({
    queryKey: ["dashboard", "recentActivity"],
    queryFn: getRecentActivity,
  });

  // Loading state
  if (overviewQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={membership?.tenantName ?? t("title")}
          description={t("description")}
        />
        <LoadingState rows={4} />
      </div>
    );
  }

  // Error state
  if (overviewQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={membership?.tenantName ?? t("title")}
          description={t("description")}
        />
        <ErrorState
          title={t("errors.loadFailed")}
          description={t("errors.loadFailedDescription")}
          onRetry={() => overviewQuery.refetch()}
        />
      </div>
    );
  }

  const overview = overviewQuery.data!;

  return (
    <div className="space-y-6">
      <PageHeader
        title={membership?.tenantName ?? t("title")}
        description={t("description")}
      />

      {/* Stats Grid: 2-col mobile, 2x2 tablet, 4-col desktop */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statConfigs.map(({ key, icon }) => {
          const stat = overview[key];
          return (
            <StatCard
              key={key}
              label={t(`stats.${key}.label`)}
              value={formatStat(stat)}
              hint={t(`stats.${key}.hint`)}
              trend={{
                direction: stat.trendDirection,
                label: stat.trendLabel,
              }}
              icon={icon}
            />
          );
        })}
      </div>

      {/* Content Grid: stacked mobile, side-by-side tablet, 2/3 + 1/3 desktop */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Engagement Card - hidden on mobile, shown md+, 2/3 on lg */}
        <Card className="hidden md:block lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("engagement.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="h-64 rounded-md bg-gradient-to-tr from-primary/5 via-primary/10 to-accent/10 flex items-center justify-center"
              aria-hidden
            >
              <p className="text-sm text-muted-foreground">
                {t("engagement.chartPlaceholder")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Card - scrollable on mobile, 1/3 on desktop */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("activity.title")}</CardTitle>
          </CardHeader>
          <CardContent className="max-h-80 overflow-y-auto md:max-h-none">
            {activityQuery.isLoading ? (
              <LoadingState rows={5} />
            ) : activityQuery.isError ? (
              <ErrorState
                title={t("errors.activityLoadFailed")}
                onRetry={() => activityQuery.refetch()}
              />
            ) : (
              <ActivityFeed items={activityQuery.data?.items ?? []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
