import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterRow } from "@/components/common/FilterRow";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { listMessageThreads } from "@/features/messages/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { usePagination } from "@/hooks/usePagination";
import { sanitizeText } from "@/lib/sanitize";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MessageThreadFlag } from "@/features/messages/types";

const FLAG_VARIANT: Record<Exclude<MessageThreadFlag, null>, "destructive" | "warning" | "secondary"> = {
  harassment: "destructive",
  explicit: "destructive",
  underage: "destructive",
  spam: "warning",
};

export function MessagesPage() {
  const { t } = useTranslation("messages");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const [flagged, setFlagged] = useState(false);
  const { pagination, setPagination } = usePagination({ pageSize: 20 });

  const query = useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "messages",
      { flagged, page: pagination.pageIndex, pageSize: pagination.pageSize },
    ],
    queryFn: () =>
      listMessageThreads({
        flagged,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <FilterRow>
        <div className="flex items-center gap-2">
          <Switch
            id="flagged-only"
            checked={flagged}
            onCheckedChange={(v) => {
              setFlagged(v);
              setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
            }}
          />
          <Label htmlFor="flagged-only">{t("filters.flaggedOnly")}</Label>
        </div>
      </FilterRow>

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.data.items.length === 0 ? (
        <EmptyState title={t("empty.title")} description={t("empty.description")} />
      ) : (
        <>
          <div className="grid gap-2">
            {query.data.items.map((thread) => (
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
                    <div>{thread.messageCount} {t("columns.count").toLowerCase()}</div>
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
                total: Math.max(1, Math.ceil(query.data.total / query.data.pageSize)),
              })}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.pageIndex === 0}
                onClick={() =>
                  setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))
                }
              >
                <ChevronLeft />
                {tCommon("pagination.previous")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={
                  pagination.pageIndex + 1 >=
                  Math.ceil(query.data.total / query.data.pageSize)
                }
                onClick={() => setPagination((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))}
              >
                {tCommon("pagination.next")}
                <ChevronRight />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
