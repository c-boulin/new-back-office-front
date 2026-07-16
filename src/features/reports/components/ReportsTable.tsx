import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import type { Report, ReportStatus, ReportReason } from "../types";
import type { ServerPagination } from "@/components/common/DataTable";

export type ReportsTableProps = {
  data: Report[];
  serverPagination: ServerPagination;
  onInvestigate: (id: string) => void;
  onResolve: (id: string) => void;
  onDismiss: (id: string) => void;
  emptyTitle: string;
  emptyDescription: string;
  translations: {
    columns: {
      reporter: string;
      target: string;
      reason: string;
      status: string;
      created: string;
      actions: string;
    };
    investigate: string;
    resolve: string;
    dismiss: string;
    statuses: Record<ReportStatus, string>;
    reasons: Record<ReportReason, string>;
  };
};

function statusVariant(status: ReportStatus) {
  switch (status) {
    case "open":
      return "default" as const;
    case "investigating":
      return "secondary" as const;
    case "resolved":
      return "outline" as const;
    case "dismissed":
      return "outline" as const;
  }
}

function statusClassName(status: ReportStatus) {
  if (status === "resolved") return "border-green-500 text-green-600";
  if (status === "dismissed") return "text-muted-foreground";
  return "";
}

export function ReportsTable({
  data,
  serverPagination,
  onInvestigate,
  onResolve,
  onDismiss,
  emptyTitle,
  emptyDescription,
  translations: t,
}: ReportsTableProps) {
  const columns = useMemo<ColumnDef<Report, unknown>[]>(
    () => [
      {
        accessorKey: "reporterName",
        header: t.columns.reporter,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.reporterName}</span>
        ),
      },
      {
        accessorKey: "targetName",
        header: t.columns.target,
        cell: ({ row }) => (
          <span className="font-medium">{row.original.targetName}</span>
        ),
      },
      {
        accessorKey: "reason",
        header: t.columns.reason,
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize">
            {t.reasons[row.original.reason]}
          </Badge>
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
        accessorKey: "createdAt",
        header: t.columns.created,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(row.original.createdAt), {
              addSuffix: true,
            })}
          </span>
        ),
      },
      {
        id: "actions",
        header: t.columns.actions,
        cell: ({ row }) => {
          const report = row.original;
          const isActionable =
            report.status === "open" || report.status === "investigating";

          if (!isActionable) return null;

          return (
            <PermissionGate require={PERMISSIONS.REPORTS_RESOLVE}>
              <div className="flex items-center gap-1">
                {report.status === "open" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onInvestigate(report.id)}
                    title={t.investigate}
                  >
                    <Eye />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onResolve(report.id)}
                  title={t.resolve}
                >
                  <CheckCircle />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDismiss(report.id)}
                  title={t.dismiss}
                >
                  <XCircle />
                </Button>
              </div>
            </PermissionGate>
          );
        },
      },
    ],
    [t, onInvestigate, onResolve, onDismiss],
  );

  return (
    <DataTable<Report>
      columns={columns}
      data={data}
      serverPagination={serverPagination}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      getRowId={(row) => row.id}
    />
  );
}
