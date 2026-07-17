import type { CSSProperties } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Heart, MessagesSquare, Percent, Star } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatchesOverview } from "@/features/matches/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";

export function MatchesOverview() {
  const { t } = useTranslation("matches");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "matches"],
    queryFn: getMatchesOverview,
  });

  const trendMax = Math.max(...data.matchesByDay.map((d) => d.value), 1);
  const qualityMax = Math.max(...data.qualityDistribution.map((d) => d.count), 1);
  const geoMax = Math.max(...data.geoDistribution.map((d) => d.count), 1);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("stats.total")} value={data.totalMatches.toLocaleString()} icon={Heart} />
        <StatCard label={t("stats.rate")} value={`${data.matchRatePct}%`} icon={Percent} />
        <StatCard label={t("stats.quality")} value={data.averageQuality.toFixed(2)} icon={Star} />
        <StatCard
          label={t("stats.median_messages")}
          value={data.medianMessagesPerMatch.toString()}
          icon={MessagesSquare}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.trend")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-1">
              {data.matchesByDay.map((point) => (
                <div
                  key={point.date}
                  className="h-[var(--bar)] flex-1 rounded-t bg-primary/70"
                  style={{ "--bar": `${Math.max(4, (point.value / trendMax) * 100)}%` } as CSSProperties}
                  title={`${point.date}: ${point.value.toLocaleString()}`}
                >
                  <span className="sr-only">
                    {point.date}: {point.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.quality")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.qualityDistribution.map((bucket) => (
                <div key={bucket.bucket} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{bucket.bucket}</span>
                    <span className="text-muted-foreground">{bucket.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full w-[var(--bar)] bg-primary"
                      style={{ "--bar": `${(bucket.count / qualityMax) * 100}%` } as CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.geo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.geoDistribution.map((row) => (
              <div key={row.country} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>{row.country}</span>
                  <span className="text-muted-foreground">{row.count.toLocaleString()}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full w-[var(--bar)] bg-accent"
                    style={{ "--bar": `${(row.count / geoMax) * 100}%` } as CSSProperties}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
