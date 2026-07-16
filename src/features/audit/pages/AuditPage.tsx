import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { PermissionGate } from "@/components/common/PermissionGate";
import { PERMISSIONS } from "@/lib/permissions";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { listAuditEvents } from "@/features/audit/api";
import { AuditEventCard } from "@/features/audit/components/AuditEventCard";
import { AuditTable } from "@/features/audit/components/AuditTable";
import { AuditFilters } from "@/features/audit/components/AuditFilters";
import type { AuditAction } from "@/features/audit/types";

export function AuditPage() {
  const { t } = useTranslation("audit");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });

  const [search, setSearch] = useState("");
  const [action, setAction] = useState<AuditAction | "all">("all");

  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: [
      "audit",
      "list",
      {
        search: debouncedSearch,
        action,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    ],
    queryFn: () =>
      listAuditEvents({
        search: debouncedSearch,
        action,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    placeholderData: (prev) => prev,
  });

  const handleReset = () => {
    setSearch("");
    setAction("all");
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  return (
    <PermissionGate require={PERMISSIONS.AUDIT_READ}>
      <div className="space-y-6">
        <PageHeader title={t("title")} description={t("description")} />

        <AuditFilters
          search={search}
          onSearchChange={setSearch}
          action={action}
          onActionChange={(v) => {
            setAction(v);
            setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
          }}
          onReset={handleReset}
        />

        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState onRetry={() => void query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState title={t("empty.title")} description={t("empty.description")} />
        ) : isDesktop ? (
          <AuditTable
            data={query.data.items}
            total={query.data.total}
            pageSize={query.data.pageSize}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        ) : (
          <div className="space-y-3">
            {query.data.items.map((event) => (
              <AuditEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </PermissionGate>
  );
}
