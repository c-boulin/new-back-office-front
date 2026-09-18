import type { CSSProperties } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Heart, MessageCircle, Percent } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEngagementStats } from "@/features/statistics/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { StatsDateParams } from "@/features/statistics/types";

export function EngagementTab({ dateParams }: { dateParams: StatsDateParams }) {
  const { t } = useTranslation("statistics");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "stats", "engagement", dateParams],
    queryFn: () => getEngagementStats(dateParams),
  });

  const seriesEntries = [
    { key: "likes", series: data.likes, label: t("engagement.likes") },
    { key: "matches", series: data.matches, label: t("engagement.matches") },
    { key: "conversations", series: data.conversations, label: t("engagement.conversations") },
    { key: "messages", series: data.messages, label: t("engagement.messages") },
  ] as const;

  const funnelSteps = [
    { label: t("engagement.funnel.activeUsers"), value: data.funnel.activeUsers, rate: null },
    { label: t("engagement.funnel.liked"), value: data.funnel.usersWhoLiked, rate: data.funnel.activeToLiked },
    { label: t("engagement.funnel.matched"), value: data.funnel.usersWhoMatched, rate: data.funnel.likedToMatched },
    { label: t("engagement.funnel.conversation"), value: data.funnel.usersWhoStartedConversation, rate: data.funnel.matchedToConversation },
    { label: t("engagement.funnel.reply"), value: data.funnel.usersWhoGotReply, rate: data.funnel.conversationToReply },
  ];

  const funnelMax = Math.max(...funnelSteps.map((s) => s.value), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("engagement.matchRate")}
          value={`${(data.matchRate * 100).toFixed(1)}%`}
          icon={Heart}
        />
        <StatCard
          label={t("engagement.conversationRate")}
          value={`${(data.conversationRate * 100).toFixed(1)}%`}
          icon={MessageCircle}
        />
        <StatCard
          label={t("engagement.responseRate")}
          value={`${(data.responseRate * 100).toFixed(1)}%`}
          icon={Percent}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {seriesEntries.map(({ key, series, label }) => {
          const max = Math.max(...series.map((d) => d.count), 1);
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-end gap-1">
                  {series.map((d) => (
                    <div
                      key={d.date}
                      className="h-[var(--bar)] flex-1 rounded-t bg-primary/70"
                      style={{ "--bar": `${Math.max(4, (d.count / max) * 100)}%` } as CSSProperties}
                      title={`${d.date}: ${d.count}`}
                    >
                      <span className="sr-only">{d.date}: {d.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("engagement.funnel.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {funnelSteps.map((step) => (
              <div key={step.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{step.label}</span>
                  <span className="text-muted-foreground">
                    {step.value.toLocaleString()}
                    {step.rate !== null ? ` (${(step.rate * 100).toFixed(1)}%)` : ""}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full w-[var(--bar)] bg-primary"
                    style={{ "--bar": `${(step.value / funnelMax) * 100}%` } as CSSProperties}
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
