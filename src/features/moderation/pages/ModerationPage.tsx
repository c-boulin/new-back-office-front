import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePagination } from "@/hooks/usePagination";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { useDebounce } from "@/hooks/useDebounce";
import {
  listModerationItems,
  approveModerationItem,
  rejectModerationItem,
  escalateModerationItem,
} from "../api";
import { ModerationFilters } from "../components/ModerationFilters";
import { ModerationTable } from "../components/ModerationTable";
import { ModerationItemCard } from "../components/ModerationItemCard";
import type { ModerationItemType, ModerationStatus } from "../types";

type ConfirmAction = { type: "reject" | "escalate"; id: string } | null;

export function ModerationPage() {
  const { t } = useTranslation("moderation");
  const { id: tenantId } = useActiveTenant();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  // Filter state
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ModerationItemType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ModerationStatus | "all">("all");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });

  const debouncedSearch = useDebounce(search, 300);

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  // Query
  const queryKey = [
    "tenant",
    tenantId,
    "moderation",
    "list",
    {
      type: typeFilter,
      status: statusFilter,
      search: debouncedSearch,
      page: pagination.pageIndex,
      pageSize: pagination.pageSize,
    },
  ];

  const query = useQuery({
    queryKey,
    queryFn: () =>
      listModerationItems({
        type: typeFilter,
        status: statusFilter,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

  // Mutations
  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["tenant", tenantId, "moderation"] });
  }, [queryClient, tenantId]);

  const approveMutation = useMutation({
    mutationFn: approveModerationItem,
    onSuccess: invalidate,
  });

  const rejectMutation = useMutation({
    mutationFn: rejectModerationItem,
    onSuccess: () => {
      setConfirmAction(null);
      invalidate();
    },
  });

  const escalateMutation = useMutation({
    mutationFn: escalateModerationItem,
    onSuccess: () => {
      setConfirmAction(null);
      invalidate();
    },
  });

  // Action handlers
  const handleApprove = useCallback((id: string) => {
    approveMutation.mutate(id);
  }, [approveMutation]);

  const handleReject = useCallback((id: string) => {
    setConfirmAction({ type: "reject", id });
  }, []);

  const handleEscalate = useCallback((id: string) => {
    setConfirmAction({ type: "escalate", id });
  }, []);

  const handleConfirm = useCallback(() => {
    if (!confirmAction) return;
    if (confirmAction.type === "reject") {
      rejectMutation.mutate(confirmAction.id);
    } else {
      escalateMutation.mutate(confirmAction.id);
    }
  }, [confirmAction, rejectMutation, escalateMutation]);

  // Reset filters
  const handleReset = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setStatusFilter("all");
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  }, [setPagination, pagination.pageSize]);

  // Render content based on state
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
          icon={ShieldAlert}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      );
    }

    if (isDesktop) {
      return (
        <ModerationTable
          data={items}
          serverPagination={{
            pagination,
            onPaginationChange: setPagination,
            pageCount: Math.max(1, Math.ceil(total / pageSize)),
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onEscalate={handleEscalate}
        />
      );
    }

    // Mobile: card list
    return (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <ModerationItemCard
            key={item.id}
            item={item}
            onApprove={handleApprove}
            onReject={handleReject}
            onEscalate={handleEscalate}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <ModerationFilters
        search={search}
        onSearchChange={setSearch}
        type={typeFilter}
        onTypeChange={(v) => {
          setTypeFilter(v);
          setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        }}
        status={statusFilter}
        onStatusChange={(v) => {
          setStatusFilter(v);
          setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        }}
        onReset={handleReset}
      />

      {renderContent()}

      {/* Confirm dialog for destructive actions */}
      <ConfirmDialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmAction(null);
        }}
        title={
          confirmAction?.type === "reject"
            ? t("confirm.rejectTitle")
            : t("confirm.escalateTitle")
        }
        description={
          confirmAction?.type === "reject"
            ? t("confirm.rejectDescription")
            : t("confirm.escalateDescription")
        }
        confirmLabel={
          confirmAction?.type === "reject"
            ? t("actions.reject")
            : t("actions.escalate")
        }
        destructive
        loading={rejectMutation.isPending || escalateMutation.isPending}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
