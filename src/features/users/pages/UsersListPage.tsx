import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import type { PaginationState } from "@tanstack/react-table";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { UserDetailSheet } from "@/features/users/components/UserDetailSheet";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useDebounce } from "@/hooks/useDebounce";
import { useUrlState, urlEnum, urlInt, urlString } from "@/hooks/useUrlState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRecord, UserStatus } from "@/features/users/types";

const STATUSES = ["all", "active", "unverified", "banned", "shadow_banned"] as const;
type StatusFilter = (typeof STATUSES)[number];

const usersSpec = {
  q: urlString(""),
  status: urlEnum<StatusFilter>(STATUSES, "all"),
  page: urlInt(0, 0),
  size: urlInt(20, 1),
};

export function UsersListPage() {
  const { t } = useTranslation("users");
  const [state, setState] = useUrlState(usersSpec);
  const [searchInput, setSearchInput] = useState(state.q);
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    if (debouncedSearch !== state.q) {
      setState({ q: debouncedSearch, page: 0 });
    }
  }, [debouncedSearch, state.q, setState]);

  const pagination: PaginationState = { pageIndex: state.page, pageSize: state.size };
  const setPagination: Dispatch<SetStateAction<PaginationState>> = (updater) => {
    const next = typeof updater === "function" ? updater(pagination) : updater;
    setState({ page: next.pageIndex, size: next.pageSize });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("list.title")} description={t("list.description")} />

      <FilterBar
        search={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t("list.search")}
        onReset={() => {
          setSearchInput("");
          setState({ q: "", status: "all", page: 0 });
        }}
      >
        <Select
          value={state.status}
          onValueChange={(v) => setState({ status: v as StatusFilter, page: 0 })}
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
        <UsersTable
          search={state.q}
          status={state.status as UserStatus | "all"}
          pagination={pagination}
          onPaginationChange={setPagination}
          onView={(user) => setSelected(user)}
        />
      </RouteBoundary>

      <UserDetailSheet
        user={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
