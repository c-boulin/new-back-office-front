import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Flag } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { toast } from "@/components/ui/sonner";
import { listReports, resolveReport, dismissReport, investigateReport } from "../api";
import { ReportCard } from "../components/ReportCard";
import { ReportsTable } from "../components/ReportsTable";
import { ReportsFilters } from "../components/ReportsFilters";
import type { ReportStatus, ReportReason } from "../types";

const STATUS_TABS: (ReportStatus | "all")[] = [
  "all",
  "open",
  "investigating",
  "resolved",
  "dismissed",
];

export function ReportsPage() {
  const { t } = useTranslation("reports");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const qc = useQueryClient();

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReportStatus | "all">("all");
  const [reason, setReason] = useState<ReportReason | "all">("all");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const debouncedSearch = useDebounce(search, 300);

  // Confirm dialogs
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [dismissId, setDismissId] = useState<string | null>(null);

  // Query
  const query = useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "reports",
      "list",
      {
        search: debouncedSearch,
        status,
        reason,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    ],
    queryFn: () =>
      listReports({
        search: debouncedSearch,
        status,
        reason,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

  // Mutations
  const investigateMutation = useMutation({
    mutationFn: investigateReport,
    onSuccess: () => {
      toast.success(t("actions.investigateSuccess"));
      void qc.invalidateQueries({ queryKey: ["tenant", tenantId, "reports"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: resolveReport,
    onSuccess: () => {
      toast.success(t("actions.resolveSuccess"));
      setResolveId(null);
      void qc.invalidateQueries({ queryKey: ["tenant", tenantId, "reports"] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: dismissReport,
    onSuccess: () => {
      toast.success(t("actions.dismissSuccess"));
      setDismissId(null);
      void qc.invalidateQueries({ queryKey: ["tenant", tenantId, "reports"] });
    },
  });

  // Translation objects
  const statusTranslations: Record<ReportStatus, string> = {
    open: t("status.open"),
    investigating: t("status.investigating"),
    resolved: t("status.resolved"),
    dismissed: t("status.dismissed"),
  };

  const reasonTranslations: Record<ReportReason, string> = {
    harassment: t("reason.harassment"),
    spam: t("reason.spam"),
    fake_profile: t("reason.fake_profile"),
    inappropriate_content: t("reason.inappropriate_content"),
    underage: t("reason.underage"),
    scam: t("reason.scam"),
    other: t("reason.other"),
  };

  // Handlers
  const handleInvestigate = (id: string) => {
    investigateMutation.mutate(id);
  };

  const handleResolve = (id: string) => {
    setResolveId(id);
  };

  const handleDismiss = (id: string) => {
    setDismissId(id);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setReason("all");
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  // Render content
  const renderContent = () => {
    if (query.isPending) {
      return <LoadingState />;
    }

    if (query.isError) {
      return <ErrorState onRetry={() => void query.refetch()} />;
    }

    const { items, total, pageSize } = query.data;

    if (items.length === 0) {
      return (
        <EmptyState
          icon={Flag}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      );
    }

    if (isDesktop) {
      return (
        <ReportsTable
          data={items}
          serverPagination={{
            pagination,
            onPaginationChange: setPagination,
            pageCount: Math.max(1, Math.ceil(total / pageSize)),
          }}
          onInvestigate={handleInvestigate}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
          emptyTitle={tCommon("empty.title")}
          emptyDescription={tCommon("empty.description")}
          translations={{
            columns: {
              reporter: t("columns.reporter"),
              target: t("columns.target"),
              reason: t("columns.reason"),
              status: t("columns.status"),
              created: t("columns.created"),
              actions: t("columns.actions"),
            },
            investigate: t("actions.investigate"),
            resolve: t("actions.resolve"),
            dismiss: t("actions.dismiss"),
            statuses: statusTranslations,
            reasons: reasonTranslations,
          }}
        />
      );
    }

    // Mobile: card list
    return (
      <div className="space-y-3">
        {items.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onInvestigate={handleInvestigate}
            onResolve={handleResolve}
            onDismiss={handleDismiss}
            translations={{
              investigate: t("actions.investigate"),
              resolve: t("actions.resolve"),
              dismiss: t("actions.dismiss"),
              reporter: t("columns.reporter"),
              target: t("columns.target"),
              statuses: statusTranslations,
              reasons: reasonTranslations,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("page.title")} description={t("page.description")} />

      {/* Mobile: horizontal scrollable status tabs */}
      {!isDesktop && (
        <Tabs
          value={status}
          onValueChange={(v) => {
            setStatus(v as ReportStatus | "all");
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
          }}
        >
          <TabsList className="w-full overflow-x-auto">
            {STATUS_TABS.map((s) => (
              <TabsTrigger key={s} value={s} className="min-w-fit">
                {s === "all" ? t("filters.allStatuses") : statusTranslations[s]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Desktop: full filter bar */}
      {isDesktop && (
        <ReportsFilters
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
          }}
          status={status}
          onStatusChange={(v) => {
            setStatus(v);
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
          }}
          reason={reason}
          onReasonChange={(v) => {
            setReason(v);
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
          }}
          onReset={resetFilters}
          translations={{
            searchPlaceholder: t("filters.searchPlaceholder"),
            statusLabel: t("filters.statusLabel"),
            reasonLabel: t("filters.reasonLabel"),
            allStatuses: t("filters.allStatuses"),
            allReasons: t("filters.allReasons"),
            statuses: statusTranslations,
            reasons: reasonTranslations,
          }}
        />
      )}

      {renderContent()}

      {/* Confirm Resolve Dialog */}
      <ConfirmDialog
        open={resolveId !== null}
        onOpenChange={(open) => {
          if (!open) setResolveId(null);
        }}
        title={t("dialogs.resolve.title")}
        description={t("dialogs.resolve.description")}
        confirmLabel={t("actions.resolve")}
        destructive
        loading={resolveMutation.isPending}
        onConfirm={() => {
          if (resolveId) resolveMutation.mutate(resolveId);
        }}
      />

      {/* Confirm Dismiss Dialog */}
      <ConfirmDialog
        open={dismissId !== null}
        onOpenChange={(open) => {
          if (!open) setDismissId(null);
        }}
        title={t("dialogs.dismiss.title")}
        description={t("dialogs.dismiss.description")}
        confirmLabel={t("actions.dismiss")}
        destructive
        loading={dismissMutation.isPending}
        onConfirm={() => {
          if (dismissId) dismissMutation.mutate(dismissId);
        }}
      />
    </div>
  );
}
