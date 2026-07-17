import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DataTable } from "@/components/common/DataTable";
import { DataList } from "@/components/common/DataList";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { FilterRow } from "@/components/common/FilterRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModerationColumns } from "@/features/moderation/components/ModerationColumns";
import {
  approveItem,
  escalateItem,
  listModeration,
  rejectItem,
} from "@/features/moderation/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { usePagination } from "@/hooks/usePagination";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import { sanitizeText } from "@/lib/sanitize";
import type {
  ModerationItem,
  ModerationItemStatus,
  ModerationItemType,
} from "@/features/moderation/types";

const STATUSES: (ModerationItemStatus | "all")[] = [
  "all",
  "pending",
  "approved",
  "rejected",
  "escalated",
];
const TYPES: (ModerationItemType | "all")[] = ["all", "profile", "photo", "message", "report"];

export function ModerationPage() {
  const { t } = useTranslation("moderation");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const { can } = usePermissions();
  const canAct = can(PERMISSIONS.MODERATION_ACT);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const [status, setStatus] = useState<ModerationItemStatus | "all">("all");
  const [type, setType] = useState<ModerationItemType | "all">("all");
  const [pendingReject, setPendingReject] = useState<ModerationItem | null>(null);

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "moderation",
      { status, type, page: pagination.pageIndex, pageSize: pagination.pageSize },
    ],
    queryFn: () =>
      listModeration({ status, type, page: pagination.pageIndex, pageSize: pagination.pageSize }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tenant", tenantId, "moderation"] });

  const approveMut = useMutation({
    mutationFn: (id: string) => approveItem(id),
    onSuccess: () => {
      toast.success(t("actions.approve"));
      void invalidate();
    },
    onError: () => toast.error(tCommon("errors.title")),
  });

  const escalateMut = useMutation({
    mutationFn: (id: string) => escalateItem(id),
    onSuccess: () => {
      toast.success(t("actions.escalate"));
      void invalidate();
    },
    onError: () => toast.error(tCommon("errors.title")),
  });

  const rejectMut = useMutation({
    mutationFn: (input: { id: string; reason: string }) => rejectItem(input.id, input.reason),
    onSuccess: () => {
      toast.success(t("actions.reject"));
      setPendingReject(null);
      void invalidate();
    },
    onError: () => toast.error(tCommon("errors.title")),
  });

  const columns = ModerationColumns(
    {
      onApprove: (item) => approveMut.mutate(item.id),
      onReject: (item) => setPendingReject(item),
      onEscalate: (item) => escalateMut.mutate(item.id),
      canAct,
    },
    {
      columns: {
        subject: t("columns.subject"),
        type: t("columns.type"),
        status: t("columns.status"),
        severity: t("columns.severity"),
        reason: t("columns.reason"),
        created: t("columns.created"),
        actions: t("columns.actions"),
      },
      types: {
        profile: t("types.profile"),
        photo: t("types.photo"),
        message: t("types.message"),
        report: t("types.report"),
      },
      statuses: {
        pending: t("statuses.pending"),
        approved: t("statuses.approved"),
        rejected: t("statuses.rejected"),
        escalated: t("statuses.escalated"),
      },
      severity: {
        low: t("severity.low"),
        medium: t("severity.medium"),
        high: t("severity.high"),
      },
      actions: {
        approve: t("actions.approve"),
        reject: t("actions.reject"),
        escalate: t("actions.escalate"),
      },
    },
  );

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <FilterRow
        onReset={() => {
          setStatus("all");
          setType("all");
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
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t("filters.type")} />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map((ty) => (
              <SelectItem key={ty} value={ty}>
                {ty === "all" ? t("filters.all") : t(`types.${ty}`)}
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
                    {t(`types.${item.type}`)} · {format(new Date(item.createdAt), "MMM d")}
                  </p>
                </div>
                <Badge>{t(`statuses.${item.status}`)}</Badge>
              </div>
              <p className="text-sm">{sanitizeText(item.reason)}</p>
              {canAct && item.status === "pending" ? (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => approveMut.mutate(item.id)}>
                    {t("actions.approve")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => escalateMut.mutate(item.id)}
                  >
                    {t("actions.escalate")}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setPendingReject(item)}
                  >
                    {t("actions.reject")}
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
        open={Boolean(pendingReject)}
        onOpenChange={(open) => !open && setPendingReject(null)}
        title={t("confirm.reject.title")}
        description={t("confirm.reject.description")}
        confirmLabel={t("confirm.reject.confirm")}
        destructive
        loading={rejectMut.isPending}
        onConfirm={() => {
          if (pendingReject) rejectMut.mutate({ id: pendingReject.id, reason: "policy_violation" });
        }}
      />
    </div>
  );
}
