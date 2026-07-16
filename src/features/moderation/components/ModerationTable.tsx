import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { type ColumnDef } from "@tanstack/react-table";
import { Check, X, TriangleAlert as AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type ServerPagination } from "@/components/common/DataTable";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import type { ModerationItem } from "../types";

type StatusVariant = "default" | "secondary" | "destructive" | "success" | "warning" | "outline";

const STATUS_VARIANT: Record<string, StatusVariant> = {
  pending: "warning",
  approved: "success",
  rejected: "destructive",
  escalated: "secondary",
};

export type ModerationTableProps = {
  data: ModerationItem[];
  serverPagination: ServerPagination;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEscalate: (id: string) => void;
};

export function ModerationTable({
  data,
  serverPagination,
  onApprove,
  onReject,
  onEscalate,
}: ModerationTableProps) {
  const { t } = useTranslation("moderation");

  const columns = useMemo<ColumnDef<ModerationItem, unknown>[]>(
    () => [
      {
        id: "user",
        header: t("columns.user"),
        size: 160,
        cell: ({ row }) => {
          const item = row.original;
          const initial = item.userDisplayName.charAt(0).toUpperCase();
          return (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                {initial}
              </div>
              <span className="truncate text-sm font-medium">{item.userDisplayName}</span>
            </div>
          );
        },
      },
      {
        id: "type",
        header: t("columns.type"),
        size: 100,
        cell: ({ row }) => (
          <Badge variant="outline">{t(`types.${row.original.type}`)}</Badge>
        ),
      },
      {
        id: "content",
        header: t("columns.content"),
        size: 240,
        cell: ({ row }) => {
          const content = row.original.content;
          const truncated = content.length > 80 ? `${content.slice(0, 80)}…` : content;
          return <span className="text-sm text-muted-foreground">{truncated}</span>;
        },
      },
      {
        id: "reason",
        header: t("columns.reason"),
        size: 160,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.reason}</span>
        ),
      },
      {
        id: "status",
        header: t("columns.status"),
        size: 110,
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "secondary"}>
            {t(`statuses.${row.original.status}`)}
          </Badge>
        ),
      },
      {
        id: "reportedAt",
        header: t("columns.reportedAt"),
        size: 130,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {new Date(row.original.reportedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: "actions",
        header: t("columns.actions"),
        size: 130,
        cell: ({ row }) => (
          <PermissionGate require={PERMISSIONS.MODERATION_ACT}>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("actions.approve")}
                onClick={() => onApprove(row.original.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("actions.reject")}
                onClick={() => onReject(row.original.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("actions.escalate")}
                onClick={() => onEscalate(row.original.id)}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </div>
          </PermissionGate>
        ),
      },
    ],
    [t, onApprove, onReject, onEscalate],
  );

  return (
    <DataTable<ModerationItem>
      columns={columns}
      data={data}
      serverPagination={serverPagination}
      emptyTitle={t("empty.title")}
      emptyDescription={t("empty.description")}
      getRowId={(row) => row.id}
    />
  );
}

  )
}