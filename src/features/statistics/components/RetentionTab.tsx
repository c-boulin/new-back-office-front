import type { CSSProperties } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { TrendingDown } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRetentionStats } from "@/features/statistics/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { StatsDateParams } from "@/features/statistics/types";

export function RetentionTab({ dateParams }: { dateParams: StatsDateParams }) {
  const { t } = useTranslation("statistics");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "stats", "retention", dateParams],
    queryFn: () => getRetentionStats(dateParams),
  });

  const retentionBars = [
    { label: t("retention.day1"), value: data.day1 },
    { label: t("retention.day7"), value: data.day7 },
    { label: t("retention.day30"), value: data.day30 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("retention.day1")}
          value={`${(data.day1 * 100).toFixed(1)}%`}
        />
        <StatCard
          label={t("retention.day7")}
          value={`${(data.day7 * 100).toFixed(1)}%`}
        />
        <StatCard
          label={t("retention.day30")}
          value={`${(data.day30 * 100).toFixed(1)}%`}
        />
        <StatCard
          label={t("retention.churn")}
          value={`${(data.churn * 100).toFixed(1)}%`}
          icon={TrendingDown}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("retention.curve")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {retentionBars.map((bar) => (
              <div key={bar.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{bar.label}</span>
                  <span className="text-muted-foreground">{(bar.value * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full w-[var(--bar)] bg-primary"
                    style={{ "--bar": `${bar.value * 100}%` } as CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
