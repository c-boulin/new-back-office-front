import type { ReactNode } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationState } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";

export type DataListProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  serverPagination?: {
    pagination: PaginationState;
    onPaginationChange: Dispatch<SetStateAction<PaginationState>>;
    pageCount: number;
  };
};

export function DataList<T>({
  items,
  getKey,
  renderCard,
  emptyTitle,
  emptyDescription,
  serverPagination,
}: DataListProps<T>) {
  const { t } = useTranslation("common");

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? t("empty.title")}
        description={emptyDescription ?? t("empty.description")}
      />
    );
  }

  const canPrev = serverPagination ? serverPagination.pagination.pageIndex > 0 : false;
  const canNext = serverPagination
    ? serverPagination.pagination.pageIndex + 1 < serverPagination.pageCount
    : false;

  return (
    <div className="space-y-3">
      <div className="grid gap-3">
        {items.map((item) => (
          <Card key={getKey(item)} className="p-4">
            {renderCard(item)}
          </Card>
        ))}
      </div>

      {serverPagination ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("pagination.page", {
              page: serverPagination.pagination.pageIndex + 1,
              total: Math.max(serverPagination.pageCount, 1),
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canPrev}
              onClick={() =>
                serverPagination.onPaginationChange((p) => ({
                  ...p,
                  pageIndex: Math.max(0, p.pageIndex - 1),
                }))
              }
            >
              <ChevronLeft />
              {t("pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canNext}
              onClick={() =>
                serverPagination.onPaginationChange((p) => ({ ...p, pageIndex: p.pageIndex + 1 }))
              }
            >
              {t("pagination.next")}
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
