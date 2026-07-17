import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterRow } from "@/components/common/FilterRow";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessagesThreadList } from "@/features/messages/components/MessagesThreadList";
import { usePagination } from "@/hooks/usePagination";

export function MessagesPage() {
  const { t } = useTranslation("messages");
  const [flagged, setFlagged] = useState(false);
  const { pagination, setPagination } = usePagination({ pageSize: 20 });

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

      <RouteBoundary>
        <MessagesThreadList
          flagged={flagged}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </RouteBoundary>
    </div>
  );
}
