import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { PaginationState } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterRow } from "@/components/common/FilterRow";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessagesThreadList } from "@/features/messages/components/MessagesThreadList";
import { useUrlState, urlBool, urlInt } from "@/hooks/useUrlState";

const messagesSpec = {
  flagged: urlBool(false),
  page: urlInt(0, 0),
  size: urlInt(20, 1),
};

export function MessagesPage() {
  const { t } = useTranslation("messages");
  const [state, setState] = useUrlState(messagesSpec);

  const pagination: PaginationState = { pageIndex: state.page, pageSize: state.size };
  const setPagination: Dispatch<SetStateAction<PaginationState>> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    setState({ page: next.pageIndex, size: next.pageSize });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />

      <FilterRow>
        <div className="flex items-center gap-2">
          <Switch
            id="flagged-only"
            checked={state.flagged}
            onCheckedChange={(v) => setState({ flagged: v, page: 0 })}
          />
          <Label htmlFor="flagged-only">{t("filters.flaggedOnly")}</Label>
        </div>
      </FilterRow>

      <RouteBoundary>
        <MessagesThreadList
          flagged={state.flagged}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </RouteBoundary>
    </div>
  );
}
