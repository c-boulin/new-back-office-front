import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { Activity, Flag, Heart, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getTenantDashboard } from "@/features/dashboard/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { sanitizeText } from "@/lib/sanitize";

const STAT_ICONS: Record<string, LucideIcon> = {
  dau: Users,
  matches: Heart,
  reports_open: Flag,
  sessions: Activity,
};

function pickIcon(id: string): LucideIcon {
  return STAT_ICONS[id] ?? Activity;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function DashboardContent() {
  const { t } = useTranslation("dashboard");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "dashboard"],
    queryFn: getTenantDashboard,
  });

  const engagementMax = useMemo(
    () => Math.max(...data.engagement.map((p) => p.value), 1),
    [data.engagement],
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard
            key={stat.id}
            label={sanitizeText(stat.label)}
            value={sanitizeText(stat.formatted)}
            hint={sanitizeText(stat.hint)}
            trend={{ direction: stat.trend.direction, label: sanitizeText(stat.trend.label) }}
            icon={pickIcon(stat.id)}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("sections.engagement")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-end gap-1">
              {data.engagement.map((point) => {
                const heightPct = Math.max(4, (point.value / engagementMax) * 100);
                return (
                  <div
                    key={point.label}
                    className="group relative flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/70 transition-all hover:from-primary/60 hover:to-primary"
                    style={{ height: `${heightPct}%` }}
                    title={`${point.label}: ${point.value.toLocaleString()}`}
                  >
                    <span className="sr-only">
                      {point.label}: {point.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.activity")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recentActivity.length === 0 ? (
              <EmptyState title={t("sections.activity")} />
            ) : (
              data.recentActivity.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{initials(event.actorName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{sanitizeText(event.actorName)}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t(`activity.${event.action}`)} {sanitizeText(event.target)}
                    </p>
                  </div>
                  <time className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  </time>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
