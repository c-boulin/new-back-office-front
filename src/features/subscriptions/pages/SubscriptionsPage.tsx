import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CreditCard, DollarSign, Users, TrendingDown } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { toast } from "@/components/ui/sonner";
import {
  getSubscriptionOverview,
  listSubscribers,
  refundSubscriber,
  cancelSubscription,
} from "../api";
import { PlanCard } from "../components/PlanCard";
import { SubscribersTable } from "../components/SubscribersTable";
import { SubscriberCard } from "../components/SubscriberCard";
import { SubscriptionsFilters } from "../components/SubscriptionsFilters";
import type { SubscriberStatus, PlanTier } from "../types";

export function SubscriptionsPage() {
  const { t } = useTranslation("subscriptions");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const qc = useQueryClient();

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SubscriberStatus | "all">("all");
  const [tier, setTier] = useState<PlanTier | "all">("all");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const debouncedSearch = useDebounce(search, 300);

  // Confirm dialogs
  const [refundId, setRefundId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  // Currency formatter
  const formatCurrency = useCallback((amount: number, currency: string) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(amount);
  }, []);

  // Queries
  const overviewQuery = useQuery({
    queryKey: ["tenant", tenantId, "subscriptions", "overview"],
    queryFn: getSubscriptionOverview,
    enabled: Boolean(tenantId),
  });

  const subscribersQuery = useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "subscriptions",
      "subscribers",
      {
        search: debouncedSearch,
        status,
        tier,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    ],
    queryFn: () =>
      listSubscribers({
        search: debouncedSearch,
        status,
        tier,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

  // Mutations
  const refundMutation = useMutation({
    mutationFn: refundSubscriber,
    onSuccess: () => {
      toast.success(t("actions.refundSuccess"));
      setRefundId(null);
      void qc.invalidateQueries({ queryKey: ["tenant", tenantId, "subscriptions"] });
    },
    onError: () => {
      toast.error(t("actions.refundError"));
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      toast.success(t("actions.cancelSuccess"));
      setCancelId(null);
      void qc.invalidateQueries({ queryKey: ["tenant", tenantId, "subscriptions"] });
    },
    onError: () => {
      toast.error(t("actions.cancelError"));
    },
  });

  // Translation maps
  const statusTranslations: Record<SubscriberStatus, string> = {
    active: t("status.active"),
    cancelled: t("status.cancelled"),
    expired: t("status.expired"),
    trial: t("status.trial"),
  };

  const tierTranslations: Record<PlanTier, string> = {
    free: t("tier.free"),
    basic: t("tier.basic"),
    premium: t("tier.premium"),
    vip: t("tier.vip"),
  };

  // Handlers
  const handleRefund = (id: string) => setRefundId(id);
  const handleCancel = (id: string) => setCancelId(id);

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setTier("all");
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  // Render overview section
  const renderOverview = () => {
    if (overviewQuery.isPending) {
      return <LoadingState rows={3} />;
    }

    if (overviewQuery.isError) {
      return <ErrorState onRetry={() => void overviewQuery.refetch()} />;
    }

    const { plans, totalRevenue, activeSubscribers, churnRate } = overviewQuery.data;

    return (
      <div className="space-y-6">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label={t("overview.totalRevenue")}
            value={formatCurrency(totalRevenue, "USD")}
            icon={DollarSign}
          />
          <StatCard
            label={t("overview.activeSubscribers")}
            value={activeSubscribers.toLocaleString()}
            icon={Users}
          />
          <StatCard
            label={t("overview.churnRate")}
            value={`${churnRate.toFixed(1)}%`}
            icon={TrendingDown}
            trend={
              churnRate > 5
                ? { direction: "down", label: t("overview.highChurn") }
                : { direction: "flat", label: t("overview.normalChurn") }
            }
          />
        </div>

        {/* Plan cards */}
        {plans.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              {t("overview.plans")}
            </h2>
            {isDesktop ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    formatCurrency={formatCurrency}
                    translations={{
                      monthly: t("plan.monthly"),
                      yearly: t("plan.yearly"),
                      subscribers: t("plan.subscribers"),
                      active: t("plan.active"),
                      inactive: t("plan.inactive"),
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    formatCurrency={formatCurrency}
                    translations={{
                      monthly: t("plan.monthly"),
                      yearly: t("plan.yearly"),
                      subscribers: t("plan.subscribers"),
                      active: t("plan.active"),
                      inactive: t("plan.inactive"),
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render subscriber list
  const renderSubscribers = () => {
    if (subscribersQuery.isPending) {
      return <LoadingState />;
    }

    if (subscribersQuery.isError) {
      return <ErrorState onRetry={() => void subscribersQuery.refetch()} />;
    }

    const { items, total, pageSize } = subscribersQuery.data;

    if (items.length === 0) {
      return (
        <EmptyState
          icon={CreditCard}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      );
    }

    if (isDesktop) {
      return (
        <SubscribersTable
          data={items}
          serverPagination={{
            pagination,
            onPaginationChange: setPagination,
            pageCount: Math.max(1, Math.ceil(total / pageSize)),
          }}
          onRefund={handleRefund}
          onCancel={handleCancel}
          formatCurrency={formatCurrency}
          emptyTitle={tCommon("empty.title")}
          emptyDescription={tCommon("empty.description")}
          translations={{
            columns: {
              user: t("columns.user"),
              plan: t("columns.plan"),
              status: t("columns.status"),
              started: t("columns.started"),
              expires: t("columns.expires"),
              amount: t("columns.amount"),
              actions: t("columns.actions"),
            },
            refund: t("actions.refund"),
            cancel: t("actions.cancel"),
            statuses: statusTranslations,
          }}
        />
      );
    }

    // Mobile: card list
    return (
      <div className="space-y-3">
        {items.map((subscriber) => (
          <SubscriberCard
            key={subscriber.id}
            subscriber={subscriber}
            onRefund={handleRefund}
            onCancel={handleCancel}
            formatCurrency={formatCurrency}
            translations={{
              plan: t("columns.plan"),
              status: t("columns.status"),
              amount: t("columns.amount"),
              period: t("columns.period"),
              refund: t("actions.refund"),
              cancel: t("actions.cancel"),
              statuses: statusTranslations,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("page.title")} description={t("page.description")} />

      {/* Overview section */}
      {renderOverview()}

      {/* Filters */}
      <SubscriptionsFilters
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
        tier={tier}
        onTierChange={(v) => {
          setTier(v);
          setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        }}
        onReset={resetFilters}
        translations={{
          searchPlaceholder: t("filters.searchPlaceholder"),
          statusLabel: t("filters.statusLabel"),
          tierLabel: t("filters.tierLabel"),
          allStatuses: t("filters.allStatuses"),
          allTiers: t("filters.allTiers"),
          statuses: statusTranslations,
          tiers: tierTranslations,
        }}
      />

      {/* Subscriber list */}
      {renderSubscribers()}

      {/* Refund Confirm Dialog */}
      <ConfirmDialog
        open={refundId !== null}
        onOpenChange={(open) => {
          if (!open) setRefundId(null);
        }}
        title={t("dialogs.refund.title")}
        description={t("dialogs.refund.description")}
        confirmLabel={t("actions.refund")}
        destructive
        loading={refundMutation.isPending}
        onConfirm={() => {
          if (refundId) refundMutation.mutate(refundId);
        }}
      />

      {/* Cancel Confirm Dialog */}
      <ConfirmDialog
        open={cancelId !== null}
        onOpenChange={(open) => {
          if (!open) setCancelId(null);
        }}
        title={t("dialogs.cancel.title")}
        description={t("dialogs.cancel.description")}
        confirmLabel={t("actions.cancel")}
        destructive
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (cancelId) cancelMutation.mutate(cancelId);
        }}
      />
    </div>
  );
}
