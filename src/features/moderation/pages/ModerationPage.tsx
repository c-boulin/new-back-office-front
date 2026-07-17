import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterRow } from "@/components/common/FilterRow";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModerationList } from "@/features/moderation/components/ModerationList";
import { approveItem, escalateItem, rejectItem } from "@/features/moderation/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { usePagination } from "@/hooks/usePagination";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
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

  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const [status, setStatus] = useState<ModerationItemStatus | "all">("all");
  const [type, setType] = useState<ModerationItemType | "all">("all");
  const [pendingReject, setPendingReject] = useState<ModerationItem | null>(null);

  const queryClient = useQueryClient();
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

      <RouteBoundary>
        <ModerationList
          status={status}
          type={type}
          pagination={pagination}
          onPaginationChange={setPagination}
          canAct={canAct}
          onApprove={(item) => approveMut.mutate(item.id)}
          onReject={(item) => setPendingReject(item)}
          onEscalate={(item) => escalateMut.mutate(item.id)}
        />
      </RouteBoundary>

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
