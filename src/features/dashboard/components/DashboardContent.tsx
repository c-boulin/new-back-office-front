import { useMemo, type CSSProperties } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Heart,
  Handshake,
  MessageSquare,
  Mail,
  Flag,
  Camera,
  BookImage,
  TriangleAlert as AlertTriangle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantDashboard } from "@/features/dashboard/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { Kpi } from "@/features/dashboard/types";

const KPI_ICONS: Record<string, LucideIcon> = {
  activeUsers: Users,
  signups: UserPlus,
  profilesValidated: UserCheck,
  profilesPending: Clock,
  likes: Heart,
  matches: Handshake,
  conversations: MessageSquare,
  messages: Mail,
  reportsPending: Flag,
};

const URGENT_ICONS: Record<string, LucideIcon> = {
  reports: Flag,
  photos: Camera,
  stories: BookImage,
};

function kpiIcon(key: string): LucideIcon {
  return KPI_ICONS[key] ?? Users;
}

function urgentIcon(type: string): LucideIcon {
  return URGENT_ICONS[type] ?? AlertTriangle;
}

function formatVariation(variation: number): { direction: "up" | "down" | "flat"; label: string } {
  if (variation === 0) return { direction: "flat", label: "0%" };
  const sign = variation > 0 ? "+" : "";
  return {
    direction: variation > 0 ? "up" : "down",
    label: `${sign}${variation.toFixed(1)}%`,
  };
}

const TOP_ROW_KPIS = ["activeUsers", "matches", "reportsPending", "signups"];

const KPI_ORDER = [
  "activeUsers",
  "signups",
  "profilesValidated",
  "profilesPending",
  "likes",
  "matches",
  "conversations",
  "messages",
  "reportsPending",
];

function orderedKpis(kpis: Record<string, Kpi>): Array<{ key: string; kpi: Kpi }> {
  const ordered: Array<{ key: string; kpi: Kpi }> = [];
  for (const key of KPI_ORDER) {
    if (kpis[key]) ordered.push({ key, kpi: kpis[key] });
  }
  for (const key of Object.keys(kpis)) {
    if (!KPI_ORDER.includes(key)) ordered.push({ key, kpi: kpis[key] });
  }
  return ordered;
}

export function DashboardContent() {
  const { t } = useTranslation("dashboard");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "dashboard"],
    queryFn: getTenantDashboard,
  });

  const kpiList = useMemo(() => orderedKpis(data.kpis), [data.kpis]);

  const topRow = kpiList.filter((k) => TOP_ROW_KPIS.includes(k.key)).slice(0, 4);
  const remaining = kpiList.filter((k) => !TOP_ROW_KPIS.includes(k.key));

  const chartKpi = kpiList.find((k) => k.key === "activeUsers") ?? kpiList[0];
  const chartMax = useMemo(
    () => Math.max(...(chartKpi?.kpi.series.map((p) => p.count) ?? [1]), 1),
    [chartKpi],
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topRow.map(({ key, kpi }) => (
          <StatCard
            key={key}
            label={t(`kpis.${key}`, key)}
            value={kpi.value.toLocaleString()}
            hint={t(`hints.${key}`, "")}
            trend={formatVariation(kpi.variation)}
            icon={kpiIcon(key)}
          />
        ))}
      </div>

      {remaining.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {remaining.map(({ key, kpi }) => (
            <StatCard
              key={key}
              label={t(`kpis.${key}`, key)}
              value={kpi.value.toLocaleString()}
              hint={t(`hints.${key}`, "")}
              trend={formatVariation(kpi.variation)}
              icon={kpiIcon(key)}
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {chartKpi && chartKpi.kpi.series.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t(`kpis.${chartKpi.key}`, chartKpi.key)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-64 items-end gap-1">
                {chartKpi.kpi.series.map((point) => {
                  const heightPct = Math.max(4, (point.count / chartMax) * 100);
                  return (
                    <div
                      key={point.date}
                      className="group relative h-[var(--bar)] flex-1 rounded-t bg-gradient-to-t from-primary/40 to-primary/70 transition-all hover:from-primary/60 hover:to-primary"
                      style={{ "--bar": `${heightPct}%` } as CSSProperties}
                      title={`${point.date}: ${point.count.toLocaleString()}`}
                    >
                      <span className="sr-only">
                        {point.date}: {point.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.urgentActions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.urgentActions.length === 0 ? (
              <EmptyState title={t("sections.noUrgent")} />
            ) : (
              data.urgentActions.map((action) => {
                const Icon = urgentIcon(action.type);
                return (
                  <div key={action.type} className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                      <Icon className="h-4 w-4 text-destructive" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{t(`urgent.${action.type}`, action.type)}</p>
                    </div>
                    <span className="text-lg font-semibold tabular-nums">{action.count.toLocaleString()}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
