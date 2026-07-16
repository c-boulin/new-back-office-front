import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { listMatches } from "../api";
import { MatchCard } from "../components/MatchCard";
import { MatchesTable } from "../components/MatchesTable";
import { MatchesFilters } from "../components/MatchesFilters";

type ActiveFilter = "all" | "active" | "inactive";

export function MatchesPage() {
  const { t } = useTranslation("matches");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Filters
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<ActiveFilter>("all");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const debouncedSearch = useDebounce(search, 300);

  // Convert filter to API format
  const activeParam = active === "all" ? "all" : active === "active";

  // Query
  const query = useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "matches",
      "list",
      {
        search: debouncedSearch,
        active: activeParam,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    ],
    queryFn: () =>
      listMatches({
        search: debouncedSearch,
        active: activeParam,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

  // Handlers
  const resetFilters = () => {
    setSearch("");
    setActive("all");
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
          icon={Heart}
          title={t("empty.title")}
          description={t("empty.description")}
        />
      );
    }

    if (isDesktop) {
      return (
        <MatchesTable
          data={items}
          serverPagination={{
            pagination,
            onPaginationChange: setPagination,
            pageCount: Math.max(1, Math.ceil(total / pageSize)),
          }}
          emptyTitle={tCommon("empty.title")}
          emptyDescription={tCommon("empty.description")}
          translations={{
            columns: {
              users: t("columns.users"),
              matched: t("columns.matched"),
              firstMessage: t("columns.firstMessage"),
              messages: t("columns.messages"),
              status: t("columns.status"),
            },
            active: t("status.active"),
            inactive: t("status.inactive"),
            noFirstMessage: t("columns.noFirstMessage"),
          }}
        />
      );
    }

    // Mobile: card list
    return (
      <div className="space-y-3">
        {items.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            translations={{
              matchedAgo: t("card.matchedAgo"),
              firstMessage: t("card.firstMessage"),
              messages: t("card.messages"),
              active: t("status.active"),
              inactive: t("status.inactive"),
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("page.title")} description={t("page.description")} />

      <MatchesFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        }}
        active={active}
        onActiveChange={(v) => {
          setActive(v);
          setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        }}
        onReset={resetFilters}
        translations={{
          searchPlaceholder: t("filters.searchPlaceholder"),
          statusLabel: t("filters.statusLabel"),
          all: t("filters.all"),
          active: t("status.active"),
          inactive: t("status.inactive"),
        }}
      />

      {renderContent()}
    </div>
  );
}
