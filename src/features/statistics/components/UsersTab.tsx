import type { CSSProperties } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Users, UserPlus, CircleCheck as CheckCircle } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUsersStats } from "@/features/statistics/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { StatsDateParams } from "@/features/statistics/types";

export function UsersTab({ dateParams }: { dateParams: StatsDateParams }) {
  const { t } = useTranslation("statistics");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "stats", "users", dateParams],
    queryFn: () => getUsersStats(dateParams),
  });

  const signupTotal = data.signups.reduce((s, d) => s + d.count, 0);
  const activeTotal = data.activeUsers.reduce((s, d) => s + d.count, 0);
  const genderTotal = data.gender.male + data.gender.female + data.gender.unknown;
  const signupMax = Math.max(...data.signups.map((d) => d.count), 1);
  const activeMax = Math.max(...data.activeUsers.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("users.signups")}
          value={signupTotal.toLocaleString()}
          icon={UserPlus}
        />
        <StatCard
          label={t("users.activeUsers")}
          value={activeTotal.toLocaleString()}
          icon={Users}
        />
        <StatCard
          label={t("users.completeProfileRate")}
          value={`${(data.completeProfileRate * 100).toFixed(1)}%`}
          icon={CheckCircle}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("users.signupsSeries")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1">
              {data.signups.map((d) => (
                <div
                  key={d.date}
                  className="h-[var(--bar)] flex-1 rounded-t bg-primary/70"
                  style={{ "--bar": `${Math.max(4, (d.count / signupMax) * 100)}%` } as CSSProperties}
                  title={`${d.date}: ${d.count}`}
                >
                  <span className="sr-only">{d.date}: {d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.activeUsersSeries")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-1">
              {data.activeUsers.map((d) => (
                <div
                  key={d.date}
                  className="h-[var(--bar)] flex-1 rounded-t bg-primary/70"
                  style={{ "--bar": `${Math.max(4, (d.count / activeMax) * 100)}%` } as CSSProperties}
                  title={`${d.date}: ${d.count}`}
                >
                  <span className="sr-only">{d.date}: {d.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("users.genderBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["male", "female", "unknown"] as const).map((key) => {
                const pct = genderTotal > 0 ? (data.gender[key] / genderTotal) * 100 : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{t(`users.gender.${key}`)}</span>
                      <span className="text-muted-foreground">
                        {data.gender[key].toLocaleString()} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full w-[var(--bar)] bg-primary"
                        style={{ "--bar": `${pct}%` } as CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.ageBreakdown")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.age.map((b) => {
                const ageTotal = data.age.reduce((s, a) => s + a.count, 0);
                const pct = ageTotal > 0 ? (b.count / ageTotal) * 100 : 0;
                return (
                  <div key={b.bucket} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{b.bucket}</span>
                      <span className="text-muted-foreground">
                        {b.count.toLocaleString()} ({pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full w-[var(--bar)] bg-accent"
                        style={{ "--bar": `${pct}%` } as CSSProperties}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("users.lastConnection")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {([
                { key: "last1Day", label: t("users.last1Day") },
                { key: "last7Days", label: t("users.last7Days") },
                { key: "last30Days", label: t("users.last30Days") },
              ] as const).map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-semibold">{data.lastConnection[key].toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.profileStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.status.map((s) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{s.status}</span>
                  <span className="font-semibold">{s.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("users.otherMetrics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("users.profilesWithoutPhoto")}</span>
                <span className="font-semibold">{data.profilesWithoutPhoto.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("users.becameActive")}</span>
                <span className="font-semibold">{(data.becameActiveAfterSignup * 100).toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.countries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("users.topCountries")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {data.countries.slice(0, 9).map((c) => (
                <div key={c.name} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground">{c.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
