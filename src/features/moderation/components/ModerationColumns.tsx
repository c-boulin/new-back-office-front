import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowUpRight, X } from "lucide-react";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { sanitizeText } from "@/lib/sanitize";
import type { ModerationItem, ModerationItemStatus } from "@/features/moderation/types";

type Actions = {
  onApprove: (item: ModerationItem) => void;
  onReject: (item: ModerationItem) => void;
  onEscalate: (item: ModerationItem) => void;
};

type Translations = {
  columns: {
    subject: string;
    type: string;
    status: string;
    severity: string;
    reason: string;
    created: string;
    actions: string;
  };
  types: Record<string, string>;
  statuses: Record<ModerationItemStatus, string>;
  severity: Record<"low" | "medium" | "high", string>;
  actions: { approve: string; reject: string; escalate: string };
};

const STATUS_VARIANT: Record<
  ModerationItemStatus,
  "default" | "secondary" | "destructive" | "success" | "warning"
> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  escalated: "secondary",
};

const SEVERITY_VARIANT: Record<
  "low" | "medium" | "high",
  "secondary" | "warning" | "destructive"
> = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
};

export function ModerationColumns(
  actions: Actions,
  t: Translations,
): ColumnDef<ModerationItem, unknown>[] {
  return [
    {
      id: "subject",
      header: t.columns.subject,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{sanitizeText(row.original.subjectName)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {sanitizeText(row.original.content)}
          </p>
        </div>
      ),
    },
    {
      id: "type",
      header: t.columns.type,
      cell: ({ row }) => (
        <span className="text-sm">{t.types[row.original.type] ?? row.original.type}</span>
      ),
    },
    {
      id: "status",
      header: t.columns.status,
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>{t.statuses[row.original.status]}</Badge>
      ),
    },
    {
      id: "severity",
      header: t.columns.severity,
      cell: ({ row }) => (
        <Badge variant={SEVERITY_VARIANT[row.original.severity]}>
          {t.severity[row.original.severity]}
        </Badge>
      ),
    },
    {
      id: "reason",
      header: t.columns.reason,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{sanitizeText(row.original.reason)}</span>
      ),
    },
    {
      id: "created",
      header: t.columns.created,
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d")}
        </span>
      ),
    },
    {
      id: "actions",
      header: t.columns.actions,
      cell: ({ row }) => {
        const item = row.original;
        const isPending = item.status === "pending";
        return (
          <PermissionGate require={PERMISSIONS.MODERATION_ACT}>
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => actions.onApprove(item)}
                disabled={!isPending}
                aria-label={t.actions.approve}
              >
                <Check />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => actions.onEscalate(item)}
                disabled={!isPending}
                aria-label={t.actions.escalate}
              >
                <ArrowUpRight />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => actions.onReject(item)}
                disabled={!isPending}
                aria-label={t.actions.reject}
              >
                <X />
              </Button>
            </div>
          </PermissionGate>
        );
      },
    },
  ];
}
