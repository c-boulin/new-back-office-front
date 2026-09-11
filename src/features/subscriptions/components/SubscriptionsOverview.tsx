import type { CSSProperties } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Coins, DollarSign, TrendingDown, Users } from "lucide-react";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSubscriptionsOverview } from "@/features/subscriptions/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function SubscriptionsOverview() {
  const { t } = useTranslation("subscriptions");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "subscriptions"],
    queryFn: getSubscriptionsOverview,
  });

  const revenueMax = Math.max(...data.revenueByMonth.map((m) => m.cents), 1);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("stats.active")} value={data.activeCount.toLocaleString()} icon={Users} />
        <StatCard
          label={t("stats.mrr")}
          value={formatMoney(data.monthlyRecurringRevenueCents, data.currency)}
          icon={DollarSign}
        />
        <StatCard
          label={t("stats.arpu")}
          value={formatMoney(data.arpuCents, data.currency)}
          icon={Coins}
        />
        <StatCard label={t("stats.churn")} value={`${data.churnRatePct}%`} icon={TrendingDown} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("sections.plans")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(plan.monthlyPriceCents, plan.currency)} / mo
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Badge variant="secondary">{plan.activeCount.toLocaleString()}</Badge>
                    <span className="text-muted-foreground">{plan.churnRatePct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sections.revenue")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-1">
              {data.revenueByMonth.map((m) => (
                <div
                  key={m.month}
                  className="h-[var(--bar)] flex-1 rounded-t bg-primary/70"
                  style={{ "--bar": `${Math.max(4, (m.cents / revenueMax) * 100)}%` } as CSSProperties}
                  title={`${m.month}: ${formatMoney(m.cents, data.currency)}`}
                >
                  <span className="sr-only">
                    {m.month}: {m.cents}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
