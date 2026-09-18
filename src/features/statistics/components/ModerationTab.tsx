import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Camera, ShieldAlert, Trash2 } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getModerationStats } from "@/features/statistics/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { StatsDateParams } from "@/features/statistics/types";

export function ModerationTab({ dateParams }: { dateParams: StatsDateParams }) {
  const { t } = useTranslation("statistics");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "stats", "moderation", dateParams],
    queryFn: () => getModerationStats(dateParams),
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("moderation.reportsPending")}
          value={data.reportsPending.toLocaleString()}
          icon={AlertTriangle}
        />
        <StatCard
          label={t("moderation.photosPending")}
          value={data.photosPending.toLocaleString()}
          icon={Camera}
        />
        <StatCard
          label={t("moderation.blockedUsers")}
          value={data.blockedUsers.toLocaleString()}
          icon={ShieldAlert}
        />
        <StatCard
          label={t("moderation.deletedUsers")}
          value={data.deletedUsers.toLocaleString()}
          icon={Trash2}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("moderation.reportsSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {([
                { label: t("moderation.reportsReceived"), value: data.reportsReceived },
                { label: t("moderation.reportsAccepted"), value: data.reportsAccepted },
                { label: t("moderation.reportsRefused"), value: data.reportsRefused },
                { label: t("moderation.storiesPending"), value: data.storiesPending },
                { label: t("moderation.usersMultipleReports"), value: data.usersWithMultipleReports },
              ]).map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold">{row.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("moderation.rates")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("moderation.confirmationRate")}</span>
                <span className="font-semibold">{(data.confirmationRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("moderation.revertRate")}</span>
                <span className="font-semibold">{(data.revertRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("moderation.avgDuration")}</span>
                <span className="font-semibold">
                  {data.averageDurationSeconds < 60
                    ? `${Math.round(data.averageDurationSeconds)}s`
                    : `${(data.averageDurationSeconds / 60).toFixed(1)}min`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.volumeByType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("moderation.volumeByType")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.volumeByType.map((v) => (
                <div key={v.type} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="font-medium">{v.type}</span>
                  <span className="text-muted-foreground">{v.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
