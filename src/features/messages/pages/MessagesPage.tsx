import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MessagesSquare } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { MessagesFilters, type FlaggedFilter } from "@/features/messages/components/MessagesFilters";
import { ConversationCard } from "@/features/messages/components/ConversationCard";
import { ConversationTable } from "@/features/messages/components/ConversationTable";
import { ConversationThread } from "@/features/messages/components/ConversationThread";
import { listConversations } from "@/features/messages/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { usePagination } from "@/hooks/usePagination";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function flaggedToApiParam(filter: FlaggedFilter): boolean | "all" {
  if (filter === "flagged") return true;
  if (filter === "clean") return false;
  return "all";
}

export function MessagesPage() {
  const { t } = useTranslation("messages");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });

  const [search, setSearch] = useState("");
  const [flagged, setFlagged] = useState<FlaggedFilter>("all");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "messages",
      "conversations",
      {
        search: debouncedSearch,
        flagged: flaggedToApiParam(flagged),
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    ],
    queryFn: () =>
      listConversations({
        search: debouncedSearch,
        flagged: flaggedToApiParam(flagged),
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

  const handleReset = () => {
    setSearch("");
    setFlagged("all");
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const pageCount = query.data
    ? Math.max(1, Math.ceil(query.data.total / query.data.pageSize))
    : 1;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <MessagesFilters
        search={search}
        onSearchChange={setSearch}
        flagged={flagged}
        onFlaggedChange={setFlagged}
        onReset={handleReset}
      />

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState
          title={t("empty.title")}
          description={t("empty.description")}
          icon={MessagesSquare}
        />
      ) : isDesktop ? (
        <ConversationTable
          data={query.data.items}
          translations={{
            participants: t("columns.participants"),
            lastMessage: t("columns.lastMessage"),
            messages: t("columns.messages"),
            flags: t("columns.flags"),
            date: t("columns.date"),
            actions: t("columns.actions"),
            viewThread: t("actions.viewThread"),
            emptyTitle: tCommon("empty.title"),
            emptyDescription: tCommon("empty.description"),
          }}
          pagination={pagination}
          onPaginationChange={setPagination}
          pageCount={pageCount}
          onViewThread={handleSelectConversation}
        />
      ) : (
        <div className="space-y-3">
          {query.data.items.map((conversation) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              onSelect={handleSelectConversation}
            />
          ))}
        </div>
      )}

      <ConversationThread
        conversationId={selectedConversationId}
        open={Boolean(selectedConversationId)}
        onOpenChange={(open) => {
          if (!open) setSelectedConversationId(null);
        }}
      />
    </div>
  );
}
