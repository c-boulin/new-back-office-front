import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RotateCcw, Circle as XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import type { Subscriber, SubscriberStatus, PlanTier } from "../types";
import type { ServerPagination } from "@/components/common/DataTable";

export type SubscribersTableProps = {
  data: Subscriber[];
  serverPagination: ServerPagination;
  onRefund: (id: string) => void;
  onCancel: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
  formatCurrency: (amount: number, currency: string) => string;
  translations: {
    columns: {
      user: string;
      plan: string;
      status: string;
      started: string;
      expires: string;
      amount: string;
      actions: string;
    };
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

export function SubscribersTable({
  data,
  serverPagination,
  onRefund,
  onCancel,
  emptyTitle,
  emptyDescription,
  formatCurrency,
  translations: t,
}: SubscribersTableProps) {
  const columns = useMemo<ColumnDef<Subscriber, unknown>[]>(
    () => [
      {
        accessorKey: "userName",
        header: t.columns.user,
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.userName}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.userEmail}</p>
          </div>
        ),
      },
      {
        accessorKey: "planName",
        header: t.columns.plan,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-sm">{row.original.planName}</span>
            <Badge className={tierBadgeClassName[row.original.planTier]}>
              {row.original.planTier}
            </Badge>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t.columns.status,
        cell: ({ row }) => (
          <Badge
            variant={statusVariant(row.original.status)}
            className={statusClassName(row.original.status)}
          >
            {t.statuses[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: "startedAt",
        header: t.columns.started,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.original.startedAt), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        accessorKey: "expiresAt",
        header: t.columns.expires,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {format(new Date(row.original.expiresAt), "MMM d, yyyy")}
          </span>
        ),
      },
      {
        accessorKey: "amountPaid",
        header: t.columns.amount,
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {formatCurrency(row.original.amountPaid, row.original.currency)}
          </span>
        ),
      },
      {
        id: "actions",
        header: t.columns.actions,
        cell: ({ row }) => {
          const subscriber = row.original;
          if (subscriber.status === "cancelled" || subscriber.status === "expired") {
            return null;
          }

          return (
            <PermissionGate require={PERMISSIONS.SUBSCRIPTIONS_REFUND}>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRefund(subscriber.id)}
                  title={t.refund}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onCancel(subscriber.id)}
                  title={t.cancel}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </PermissionGate>
          );
        },
      },
    ],
    [t, onRefund, onCancel, formatCurrency],
  );

  return (
    <DataTable<Subscriber>
      columns={columns}
      data={data}
      serverPagination={serverPagination}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      getRowId={(row) => row.id}
    />
  );
}

  )
}