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
import { ReportsList } from "@/features/reports/components/ReportsList";
import { dismissReport, resolveReport } from "@/features/reports/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { useUrlState, urlEnum, urlInt } from "@/hooks/useUrlState";
import type { Report } from "@/features/reports/types";

const STATUSES = ["all", "open", "in_review", "resolved", "dismissed"] as const;
const CATEGORIES = [
  "all",
  "harassment",
  "spam",
  "impersonation",
  "inappropriate_content",
  "underage",
  "other",
] as const;
type StatusFilter = (typeof STATUSES)[number];
type CategoryFilter = (typeof CATEGORIES)[number];

const reportsSpec = {
  status: urlEnum<StatusFilter>(STATUSES, "all"),
  category: urlEnum<CategoryFilter>(CATEGORIES, "all"),
  page: urlInt(0, 0),
  size: urlInt(20, 1),
};

export function ReportsPage() {
  const { t } = useTranslation("reports");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();

  const [state, setState] = useUrlState(reportsSpec);
  const [pendingDismiss, setPendingDismiss] = useState<Report | null>(null);

  const pagination: PaginationState = { pageIndex: state.page, pageSize: state.size };
  const setPagination: Dispatch<SetStateAction<PaginationState>> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    setState({ page: next.pageIndex, size: next.pageSize });
  };

  const queryClient = useQueryClient();
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

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <FilterRow
        onReset={() => setState({ status: "all", category: "all", page: 0 })}
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
          value={state.category}
          onValueChange={(v) => setState({ category: v as CategoryFilter, page: 0 })}
        >
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

      <RouteBoundary>
        <ReportsList
          status={state.status}
          category={state.category}
          pagination={pagination}
          onPaginationChange={setPagination}
          onResolve={(report) => resolveMut.mutate(report.id)}
          onDismiss={(report) => setPendingDismiss(report)}
        />
      </RouteBoundary>

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
