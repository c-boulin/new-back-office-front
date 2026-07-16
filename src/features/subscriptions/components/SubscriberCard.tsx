import { format } from "date-fns";
import { RotateCcw, Circle as XCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import type { Subscriber, SubscriberStatus, PlanTier } from "../types";

export type SubscriberCardProps = {
  subscriber: Subscriber;
  onRefund: (id: string) => void;
  onCancel: (id: string) => void;
  formatCurrency: (amount: number, currency: string) => string;
  translations: {
    plan: string;
    status: string;
    amount: string;
    period: string;
    refund: string;
    cancel: string;
    statuses: Record<SubscriberStatus, string>;
  };
};

const tierBadgeClassName: Record<PlanTier, string> = {
  free: "bg-muted text-muted-foreground border-transparent",
  basic: "bg-primary text-primary-foreground border-transparent",
  premium: "bg-secondary text-secondary-foreground border-transparent",
  vip: "bg-accent text-accent-foreground border-transparent",
};

function statusVariant(status: SubscriberStatus) {
  switch (status) {
    case "active":
      return "outline" as const;
    case "cancelled":
      return "destructive" as const;
    case "expired":
      return "outline" as const;
    case "trial":
      return "outline" as const;
  }
}

function statusClassName(status: SubscriberStatus) {
  switch (status) {
    case "active":
      return "border-green-500 text-green-600";
    case "cancelled":
      return "";
    case "expired":
      return "text-muted-foreground";
    case "trial":
      return "border-blue-500 text-blue-600";
  }
}

export function SubscriberCard({
  subscriber,
  onRefund,
  onCancel,
  formatCurrency,
  translations: t,
}: SubscriberCardProps) {
  const isActionable = subscriber.status === "active" || subscriber.status === "trial";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{subscriber.userName}</p>
            <p className="truncate text-xs text-muted-foreground">{subscriber.userEmail}</p>
          </div>
          <Badge
            variant={statusVariant(subscriber.status)}
            className={statusClassName(subscriber.status)}
          >
            {t.statuses[subscriber.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.plan}</span>
          <div className="flex items-center gap-1.5">
            <span className="font-medium">{subscriber.planName}</span>
            <Badge className={tierBadgeClassName[subscriber.planTier]}>
              {subscriber.planTier}
            </Badge>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.amount}</span>
          <span className="font-medium">
            {formatCurrency(subscriber.amountPaid, subscriber.currency)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t.period}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(subscriber.startedAt), "MMM d, yyyy")} →{" "}
            {format(new Date(subscriber.expiresAt), "MMM d, yyyy")}
          </span>
        </div>
      </CardContent>

      {isActionable && (
        <CardFooter className="flex-wrap gap-2">
          <PermissionGate require={PERMISSIONS.SUBSCRIPTIONS_REFUND}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRefund(subscriber.id)}
            >
              <RotateCcw className="h-4 w-4" />
              {t.refund}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(subscriber.id)}
            >
              <XCircle className="h-4 w-4" />
              {t.cancel}
            </Button>
          </PermissionGate>
        </CardFooter>
      )}
    </Card>
  );
}
