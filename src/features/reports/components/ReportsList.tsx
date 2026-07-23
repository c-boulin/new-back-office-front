import { useDeferredValue } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { DataTable } from "@/components/common/DataTable";
import { DataList } from "@/components/common/DataList";
import { PermissionGate } from "@/components/common/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { listReports } from "@/features/reports/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PERMISSIONS } from "@/lib/permissions";
import { sanitizeText } from "@/lib/sanitize";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import type { Report, ReportCategory, ReportStatus } from "@/features/reports/types";

const STATUS_VARIANT: Record<ReportStatus, "warning" | "secondary" | "success" | "destructive"> = {
  open: "warning",
  in_review: "secondary",
  resolved: "success",
  dismissed: "destructive",
};

export type ReportsListProps = {
  status: ReportStatus | "all";
  category: ReportCategory | "all";
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  onResolve: (report: Report) => void;
  onDismiss: (report: Report) => void;
};

export function ReportsList({
  status,
  category,
  pagination,
  onPaginationChange,
  onResolve,
  onDismiss,
}: ReportsListProps) {
  const { t } = useTranslation("reports");
  const { id: tenantId } = useActiveTenant();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const deferredStatus = useDeferredValue(status);
  const deferredCategory = useDeferredValue(category);
  const deferredPagination = useDeferredValue(pagination);

  const { data } = useSuspenseQuery({
    queryKey: [
      "tenant",
      tenantId,
      "reports",
      {
        status: deferredStatus,
        category: deferredCategory,
        page: deferredPagination.pageIndex,
        pageSize: deferredPagination.pageSize,
      },
    ],
    queryFn: () =>
      listReports({
        status: deferredStatus,
        category: deferredCategory,
        page: deferredPagination.pageIndex,
        pageSize: deferredPagination.pageSize,
      }),
  });

  const columns: ColumnDef<Report, unknown>[] = [
    {
      id: "subject",
      header: t("columns.subject"),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{sanitizeText(row.original.subjectName)}</p>
          <p className="truncate text-xs text-muted-foreground">
            {sanitizeText(row.original.description)}
          </p>
        </div>
      ),
    },
    {
      id: "reporter",
      header: t("columns.reporter"),
      cell: ({ row }) => (
        <span className="text-sm">{sanitizeText(row.original.reporterName)}</span>
      ),
    },
    {
      id: "category",
      header: t("columns.category"),
      cell: ({ row }) => t(`categories.${row.original.category}`),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {t(`statuses.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: "created",
      header: t("columns.created"),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "MMM d")}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("columns.actions"),
      cell: ({ row }) => {
        const item = row.original;
        const isOpen = item.status === "open" || item.status === "in_review";
        return (
          <PermissionGate require={PERMISSIONS.SIGNALEMENT_UPDATE}>
            <div className="flex justify-end gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onResolve(item)}
                disabled={!isOpen}
                aria-label={t("actions.resolve")}
              >
                <Check />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(item)}
                disabled={!isOpen}
                aria-label={t("actions.dismiss")}
              >
                <X />
              </Button>
            </div>
          </PermissionGate>
        );
      },
    },
  ];

  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));

  if (isMobile) {
    return (
      <DataList
        items={data.items}
        getKey={(item) => item.id}
        emptyTitle={t("empty.title")}
        emptyDescription={t("empty.description")}
        serverPagination={{ pagination, onPaginationChange, pageCount }}
        renderCard={(item) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{sanitizeText(item.subjectName)}</p>
                <p className="text-xs text-muted-foreground">
                  {t(`categories.${item.category}`)} · {format(new Date(item.createdAt), "MMM d")}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[item.status]}>{t(`statuses.${item.status}`)}</Badge>
            </div>
            <p className="text-sm">{sanitizeText(item.description)}</p>
            {item.status === "open" || item.status === "in_review" ? (
              <PermissionGate require={PERMISSIONS.SIGNALEMENT_UPDATE}>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => onResolve(item)}>
                    {t("actions.resolve")}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDismiss(item)}>
                    {t("actions.dismiss")}
                  </Button>
                </div>
              </PermissionGate>
            ) : null}
          </div>
        )}
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={data.items}
      getRowId={(row) => row.id}
      emptyTitle={t("empty.title")}
      emptyDescription={t("empty.description")}
      serverPagination={{ pagination, onPaginationChange, pageCount }}
    />
  );
}
