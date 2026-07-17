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
import { ReportsList } from "@/features/reports/components/ReportsList";
import { dismissReport, resolveReport } from "@/features/reports/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { usePagination } from "@/hooks/usePagination";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
import type { Report, ReportCategory, ReportStatus } from "@/features/reports/types";

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

export function ReportsPage() {
  const { t } = useTranslation("reports");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const { can } = usePermissions();
  const canAct = can(PERMISSIONS.MODERATION_ACT);

  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const [category, setCategory] = useState<ReportCategory | "all">("all");
  const [pendingDismiss, setPendingDismiss] = useState<Report | null>(null);

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

      <RouteBoundary>
        <ReportsList
          status={status}
          category={category}
          pagination={pagination}
          onPaginationChange={setPagination}
          canAct={canAct}
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
