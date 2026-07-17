import { useDeferredValue } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { DataTable } from "@/components/common/DataTable";
import { DataList } from "@/components/common/DataList";
import { PermissionGate } from "@/components/common/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModerationColumns } from "@/features/moderation/components/ModerationColumns";
import { listModeration } from "@/features/moderation/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { PERMISSIONS } from "@/lib/permissions";
import { sanitizeText } from "@/lib/sanitize";
import type { PaginationState } from "@tanstack/react-table";
import type {
  ModerationItem,
  ModerationItemStatus,
  ModerationItemType,
} from "@/features/moderation/types";

export type ModerationListProps = {
  status: ModerationItemStatus | "all";
  type: ModerationItemType | "all";
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  onApprove: (item: ModerationItem) => void;
  onReject: (item: ModerationItem) => void;
  onEscalate: (item: ModerationItem) => void;
};

export function ModerationList({
  status,
  type,
  pagination,
  onPaginationChange,
  onApprove,
  onReject,
  onEscalate,
}: ModerationListProps) {
  const { t } = useTranslation("moderation");
  const { id: tenantId } = useActiveTenant();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const deferredStatus = useDeferredValue(status);
  const deferredType = useDeferredValue(type);
  const deferredPagination = useDeferredValue(pagination);

  const { data } = useSuspenseQuery({
    queryKey: [
      "tenant",
      tenantId,
      "moderation",
      {
        status: deferredStatus,
        type: deferredType,
        page: deferredPagination.pageIndex,
        pageSize: deferredPagination.pageSize,
      },
    ],
    queryFn: () =>
      listModeration({
        status: deferredStatus,
        type: deferredType,
        page: deferredPagination.pageIndex,
        pageSize: deferredPagination.pageSize,
      }),
  });

  const columns = ModerationColumns(
    { onApprove, onReject, onEscalate },
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
                  {t(`types.${item.type}`)} · {format(new Date(item.createdAt), "MMM d")}
                </p>
              </div>
              <Badge>{t(`statuses.${item.status}`)}</Badge>
            </div>
            <p className="text-sm">{sanitizeText(item.reason)}</p>
            {item.status === "pending" ? (
              <PermissionGate require={PERMISSIONS.MODERATION_ACT}>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => onApprove(item)}>
                    {t("actions.approve")}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onEscalate(item)}>
                    {t("actions.escalate")}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onReject(item)}>
                    {t("actions.reject")}
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
