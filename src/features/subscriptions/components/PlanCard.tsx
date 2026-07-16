import { Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Plan, PlanTier } from "../types";

export type PlanCardProps = {
  plan: Plan;
  translations: {
    monthly: string;
    yearly: string;
    subscribers: string;
    active: string;
    inactive: string;
  };
  formatCurrency: (amount: number, currency: string) => string;
};

const tierBadgeClassName: Record<PlanTier, string> = {
  free: "bg-muted text-muted-foreground border-transparent",
  basic: "bg-primary text-primary-foreground border-transparent",
  premium: "bg-secondary text-secondary-foreground border-transparent",
  vip: "bg-accent text-accent-foreground border-transparent",
};

export function PlanCard({ plan, translations: t, formatCurrency }: PlanCardProps) {
  return (
    <Card className={cn("min-w-[200px] shrink-0", !plan.isActive && "opacity-60")}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold truncate">{plan.name}</h3>
          <Badge className={tierBadgeClassName[plan.tier]}>{plan.tier}</Badge>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>
            {t.monthly}:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(plan.priceMonthly, plan.currency)}
            </span>
          </p>
          <p>
            {t.yearly}:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(plan.priceYearly, plan.currency)}
            </span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" aria-hidden />
            <span>
              {plan.subscriberCount} {t.subscribers}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              plan.isActive ? "text-green-600" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                plan.isActive ? "bg-green-500" : "bg-muted-foreground/50",
              )}
            />
            {plan.isActive ? t.active : t.inactive}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
