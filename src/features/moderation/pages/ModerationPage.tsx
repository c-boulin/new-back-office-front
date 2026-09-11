import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ModerationPageHeader } from "@/features/moderation/components/ModerationPageHeader";
import { ModerationStatCards } from "@/features/moderation/components/ModerationStatCards";
import {
  ModerationTypeTabs,
  type KindFilter,
} from "@/features/moderation/components/ModerationTypeTabs";
import {
  ModerationStatusFilters,
  type StatusFilter,
} from "@/features/moderation/components/ModerationStatusFilters";
import { ModerationSplitView } from "@/features/moderation/components/ModerationSplitView";
import { approveItem, escalateItem, rejectItem } from "@/features/moderation/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { useUrlState, urlEnum, urlInt, urlString } from "@/hooks/useUrlState";
import type { ModerationItem } from "@/features/moderation/types";

const STATUSES: StatusFilter[] = ["all", "pending", "approved", "rejected", "escalated"];
const KINDS: KindFilter[] = ["all", "nickname", "profile_photo", "story", "message"];

const moderationSpec = {
  status: urlEnum<StatusFilter>(STATUSES, "all"),
  kind: urlEnum<KindFilter>(KINDS, "all"),
  page: urlInt(0, 0),
  size: urlInt(20, 1),
  selectedId: urlString(""),
};

export function ModerationPage() {
  const { t } = useTranslation("moderation");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();

  const [state, setState] = useUrlState(moderationSpec);
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

  const selectedId = state.selectedId ? state.selectedId : null;

  return (
    <div className="space-y-6">
      <ModerationPageHeader />

      <RouteBoundary>
        <ModerationStatCards />
      </RouteBoundary>

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <ModerationTypeTabs
          value={state.kind}
          onChange={(next) => setState({ kind: next, page: 0, selectedId: "" })}
        />
        <ModerationStatusFilters
          value={state.status}
          onChange={(next) => setState({ status: next, page: 0, selectedId: "" })}
        />
      </div>

      <RouteBoundary>
        <ModerationSplitView
          status={state.status}
          kind={state.kind}
          page={state.page}
          pageSize={state.size}
          selectedId={selectedId}
          onSelect={(id) => setState({ selectedId: id ?? "" })}
          onPageChange={(page) => setState({ page, selectedId: "" })}
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
