import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LoadingState } from "@/components/common/LoadingState";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { ModerationItemRow } from "./ModerationItemRow";
import { ModerationDetailPane } from "./ModerationDetailPane";
import { listModeration } from "@/features/moderation/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { ModerationItem } from "@/features/moderation/types";
import type { KindFilter } from "./ModerationTypeTabs";
import type { StatusFilter } from "./ModerationStatusFilters";

export type ModerationSplitViewProps = {
  status: StatusFilter;
  kind: KindFilter;
  page: number;
  pageSize: number;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onPageChange: (page: number) => void;
  onApprove: (item: ModerationItem) => void;
  onReject: (item: ModerationItem) => void;
  onEscalate: (item: ModerationItem) => void;
};

export function ModerationSplitView(props: ModerationSplitViewProps) {
  const { t } = useTranslation("moderation");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const { status, kind, page, pageSize, selectedId } = props;

  const { data, isFetching } = useSuspenseQuery({
    queryKey: [
      "tenant",
      tenantId,
      "moderation",
      { status, kind, page, pageSize },
    ],
    queryFn: () =>
      listModeration({
        status,
        kind,
        page,
        pageSize,
      }),
  });

  const items = data.items;
  const selected = selectedId ? (items.find((i) => i.id === selectedId) ?? null) : null;

  useEffect(() => {
    if (!selectedId && items.length > 0) {
      props.onSelect(items[0].id);
    }
  }, [items, selectedId, props]);

  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <aside className="flex flex-col gap-3 rounded-2xl border bg-card p-3 shadow-sm">
        <header className="flex items-center justify-between px-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("pendingReviewPill")}
          </p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {data.total}
          </span>
        </header>
        {items.length === 0 ? (
          <EmptyState title={t("empty.title")} description={t("empty.description")} />
        ) : (
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <ModerationItemRow
                  item={item}
                  active={item.id === selectedId}
                  onSelect={(next) => props.onSelect(next.id)}
                />
              </li>
            ))}
          </ul>
        )}
        {pageCount > 1 ? (
          <nav
            aria-label={tCommon("pagination.page", { page: page + 1, total: pageCount })}
            className="mt-2 flex items-center justify-between gap-2 border-t pt-3"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={page === 0}
              onClick={() => props.onPageChange(Math.max(0, page - 1))}
            >
              {tCommon("pagination.previous")}
            </Button>
            <span className="text-xs text-muted-foreground">
              {tCommon("pagination.page", { page: page + 1, total: pageCount })}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={page + 1 >= pageCount}
              onClick={() => props.onPageChange(page + 1)}
            >
              {tCommon("pagination.next")}
            </Button>
          </nav>
        ) : null}
        {isFetching ? <LoadingState rows={1} /> : null}
      </aside>

      <ModerationDetailPane
        item={selected}
        onApprove={props.onApprove}
        onReject={props.onReject}
        onEscalate={props.onEscalate}
      />
    </div>
  );
}
