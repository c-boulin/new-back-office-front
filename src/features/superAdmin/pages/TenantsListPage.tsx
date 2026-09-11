import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TenantsList } from "@/features/tenants/components/TenantsList";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlState, urlEnum, urlString } from "@/hooks/useUrlState";
import type { Tenant } from "@/features/tenants/types";

const STATUSES = ["all", "active", "suspended", "provisioning"] as const;
type StatusFilter = (typeof STATUSES)[number];

const spec = {
  q: urlString(""),
  status: urlEnum<StatusFilter>(STATUSES, "all"),
};

export function TenantsListPage() {
  const { t } = useTranslation("tenants");
  const [state, setState] = useUrlState(spec);
  const [searchInput, setSearchInput] = useState(state.q);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== state.q) {
      setState({ q: debouncedSearch });
    }
  }, [debouncedSearch, state.q, setState]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("list.title")}
        description={t("list.description")}
        actions={
          <Button>
            <Plus />
            {t("list.create")}
          </Button>
        }
      />

      <FilterBar
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t("list.search")}
        onReset={() => {
          setSearchInput("");
          setState({ q: "", status: "all" });
        }}
      >
        <Select
          value={state.status}
          onValueChange={(v) => setState({ status: v as StatusFilter })}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("list.filters.status")} />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? t("list.filters.all") : t(`status.${s}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      <RouteBoundary>
        <TenantsList query={state.q} status={state.status as Tenant["status"] | "all"} />
      </RouteBoundary>
    </div>
  );
}
