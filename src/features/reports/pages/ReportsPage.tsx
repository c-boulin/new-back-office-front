import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterRow } from "@/components/common/FilterRow";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DataTable } from "@/components/common/DataTable";
import { DataList } from "@/components/common/DataList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dismissReport, listReports, resolveReport } from "@/features/reports/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { usePagination } from "@/hooks/usePagination";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { sanitizeText } from "@/lib/sanitize";
import type { ColumnDef } from "@tanstack/react-table";
import type { Report, ReportCategory, ReportStatus } from "@/features/reports/types";
import { Check, X } from "lucide-react";

const STATUSES: (ReportStatus | "all")[] = ["all", "open", "in_review", "resolved", "dismissed"];
const CATEGORIES: (ReportCategory | "all")[] = [
  "all",
  "harassment",
  "spam",
  "impersonation",
  "inappropriate_content",
  "underage",
  "other",
];

const STATUS_VARIANT: Record<ReportStatus, "warning" | "secondary" | "success" | "destructive"> = {
  open: "warning",
  in_review: "secondary",
  resolved: "success",
  dismissed: "destructive",
};

export function ReportsPage() {
  const { t } = useTranslation("reports");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const { can } = usePermissions();
  const canAct = can(PERMISSIONS.MODERATION_ACT);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const [category, setCategory] = useState<ReportCategory | "all">("all");
  const [pendingDismiss, setPendingDismiss] = useState<Report | null>(null);

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "reports",
      { status, category, page: pagination.pageIndex, pageSize: pagination.pageSize },
    ],
    queryFn: () =>
      listReports({
        status,
        category,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tenant", tenantId, "reports"] });

  const resolveMut = useMutation({
    mutationFn: (id: string) => resolveReport(id),
    onSuccess: () => {
      toast.success(t("actions.resolve"));
      void invalidate();
    },
    onError: () => toast.error(tCommon("errors.title")),
  });

  const dismissMut = useMutation({
    mutationFn: (input: { id: string; reason: string }) => dismissReport(input.id, input.reason),
    onSuccess: () => {
      toast.success(t("actions.dismiss"));
      setPendingDismiss(null);
      void invalidate();
    },
    onError: () => toast.error(tCommon("errors.title")),
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
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => resolveMut.mutate(item.id)}
              disabled={!canAct || !isOpen}
              aria-label={t("actions.resolve")}
            >
              <Check />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setPendingDismiss(item)}
              disabled={!canAct || !isOpen}
              aria-label={t("actions.dismiss")}
            >
              <X />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <FilterRow
        onReset={() => {
          setStatus("all");
          setCategory("all");
          setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        }}
      >
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("filters.status")} />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? t("filters.all") : t(`statuses.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("filters.category")} />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? t("filters.all") : t(`categories.${c}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterRow>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : isMobile ? (
        <DataList
          items={query.data.items}
          getKey={(item) => item.id}
          emptyTitle={t("empty.title")}
          emptyDescription={t("empty.description")}
          serverPagination={{
            pagination,
            onPaginationChange: setPagination,
            pageCount: Math.max(1, Math.ceil(query.data.total / query.data.pageSize)),
          }}
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
              {canAct && (item.status === "open" || item.status === "in_review") ? (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => resolveMut.mutate(item.id)}>
                    {t("actions.resolve")}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setPendingDismiss(item)}>
                    {t("actions.dismiss")}
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        />
      ) : (
        <DataTable
          columns={columns}
          data={query.data.items}
          getRowId={(row) => row.id}
          emptyTitle={t("empty.title")}
          emptyDescription={t("empty.description")}
          serverPagination={{
            pagination,
            onPaginationChange: setPagination,
            pageCount: Math.max(1, Math.ceil(query.data.total / query.data.pageSize)),
          }}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDismiss)}
        onOpenChange={(open) => !open && setPendingDismiss(null)}
        title={t("confirm.dismiss.title")}
        description={t("confirm.dismiss.description")}
        confirmLabel={t("confirm.dismiss.confirm")}
        destructive
        loading={dismissMut.isPending}
        onConfirm={() => {
          if (pendingDismiss) dismissMut.mutate({ id: pendingDismiss.id, reason: "no_action" });
        }}
      />
    </div>
  );
}
