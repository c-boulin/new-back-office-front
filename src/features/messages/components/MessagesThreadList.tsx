import { useDeferredValue } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { listMessageThreads } from "@/features/messages/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { sanitizeText } from "@/lib/sanitize";
import type { PaginationState } from "@tanstack/react-table";
import type { MessageThreadFlag } from "@/features/messages/types";

const FLAG_VARIANT: Record<Exclude<MessageThreadFlag, null>, "destructive" | "warning" | "secondary"> = {
  harassment: "destructive",
  explicit: "destructive",
  underage: "destructive",
  spam: "warning",
};

export type MessagesThreadListProps = {
  flagged: boolean;
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
};

export function MessagesThreadList({
  flagged,
  pagination,
  onPaginationChange,
}: MessagesThreadListProps) {
  const { t } = useTranslation("messages");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();

  const deferredFlagged = useDeferredValue(flagged);
  const deferredPagination = useDeferredValue(pagination);

  const { data } = useSuspenseQuery({
    queryKey: [
      "tenant",
      tenantId,
      "messages",
      {
        flagged: deferredFlagged,
        page: deferredPagination.pageIndex,
        pageSize: deferredPagination.pageSize,
      },
    ],
    queryFn: () =>
      listMessageThreads({
        flagged: deferredFlagged,
        page: deferredPagination.pageIndex,
        pageSize: deferredPagination.pageSize,
      }),
  });

  if (data.items.length === 0) {
    return <EmptyState title={t("empty.title")} description={t("empty.description")} />;
  }

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {data.items.map((thread) => (
          <Card key={thread.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {sanitizeText(thread.participantA)} · {sanitizeText(thread.participantB)}
                  </p>
                  {thread.flag ? (
                    <Badge variant={FLAG_VARIANT[thread.flag]}>{t(`flags.${thread.flag}`)}</Badge>
                  ) : null}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {sanitizeText(thread.lastMessagePreview)}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>
                  {thread.messageCount} {t("columns.count").toLowerCase()}
                </div>
                <div>{format(new Date(thread.lastMessageAt), "MMM d, HH:mm")}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {tCommon("pagination.page", {
            page: pagination.pageIndex + 1,
            total: totalPages,
          })}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={pagination.pageIndex === 0}
            onClick={() =>
              onPaginationChange((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))
            }
          >
            <ChevronLeft />
            {tCommon("pagination.previous")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pagination.pageIndex + 1 >= totalPages}
            onClick={() => onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
          >
            {tCommon("pagination.next")}
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
