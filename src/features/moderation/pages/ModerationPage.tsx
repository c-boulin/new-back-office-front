import { useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PaginationState } from "@tanstack/react-table";
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
import { useUrlState, urlEnum, urlInt } from "@/hooks/useUrlState";
import type { ModerationItem } from "@/features/moderation/types";

const STATUSES = ["all", "pending", "approved", "rejected", "escalated"] as const;
const TYPES = ["all", "profile", "photo", "message", "report"] as const;
type StatusFilter = (typeof STATUSES)[number];
type TypeFilter = (typeof TYPES)[number];

const moderationSpec = {
  status: urlEnum<StatusFilter>(STATUSES, "all"),
  type: urlEnum<TypeFilter>(TYPES, "all"),
  page: urlInt(0, 0),
  size: urlInt(20, 1),
};

export function ModerationPage() {
  const { t } = useTranslation("moderation");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();

  const [state, setState] = useUrlState(moderationSpec);
  const [pendingReject, setPendingReject] = useState<ModerationItem | null>(null);

  const pagination: PaginationState = { pageIndex: state.page, pageSize: state.size };
  const setPagination: Dispatch<SetStateAction<PaginationState>> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    setState({ page: next.pageIndex, size: next.pageSize });
  };

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
        onReset={() => setState({ status: "all", type: "all", page: 0 })}
      >
        <Select
          value={state.status}
          onValueChange={(v) => setState({ status: v as StatusFilter, page: 0 })}
        >
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
        <Select
          value={state.type}
          onValueChange={(v) => setState({ type: v as TypeFilter, page: 0 })}
        >
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
          status={state.status}
          type={state.type}
          pagination={pagination}
          onPaginationChange={setPagination}
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
