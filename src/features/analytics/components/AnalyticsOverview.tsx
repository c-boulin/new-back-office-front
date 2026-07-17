import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Percent, UserCheck, Users } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalyticsOverview } from "@/features/analytics/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";

export function AnalyticsOverview() {
  const { t } = useTranslation("analytics");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "analytics"],
    queryFn: getAnalyticsOverview,
  });

  const activityMax = Math.max(...data.activityByHour.map((a) => a.value), 1);
  const funnelMax = Math.max(...data.funnel.map((f) => f.count), 1);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("stats.dau")}
          value={data.dailyActiveUsers.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label={t("stats.mau")}
          value={data.monthlyActiveUsers.toLocaleString()}
          icon={UserCheck}
        />
        <StatCard
          label={t("stats.stickiness")}
          value={`${(data.stickinessRatio * 100).toFixed(1)}%`}
          icon={Percent}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.retention")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.retention.map((r) => (
                <div key={r.day} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Day {r.day}</span>
                    <span className="text-muted-foreground">{r.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${r.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.funnel")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.funnel.map((step) => (
                <div key={step.step} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{step.step}</span>
                    <span className="text-muted-foreground">
                      {step.count.toLocaleString()} ({(step.conversion * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-accent"
                      style={{ width: `${(step.count / funnelMax) * 100}%` }}
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
          <CardTitle>{t("sections.activity")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-40 items-end gap-1">
            {data.activityByHour.map((h) => (
              <div
                key={h.hour}
                className="flex-1 rounded-t bg-primary/70"
                style={{ height: `${Math.max(4, (h.value / activityMax) * 100)}%` }}
                title={`${h.hour}h: ${h.value}`}
              >
                <span className="sr-only">
                  {h.hour}: {h.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
