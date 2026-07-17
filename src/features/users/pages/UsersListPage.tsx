import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { UserDetailSheet } from "@/features/users/components/UserDetailSheet";
import { UsersTable } from "@/features/users/components/UsersTable";
import { useDebounce } from "@/hooks/useDebounce";
import { usePagination } from "@/hooks/usePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRecord, UserStatus } from "@/features/users/types";

const STATUSES: (UserStatus | "all")[] = [
  "all",
  "active",
  "unverified",
  "banned",
  "shadow_banned",
];

export function UsersListPage() {
  const { t } = useTranslation("users");
  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [selected, setSelected] = useState<UserRecord | null>(null);

  const debounced = useDebounce(search, 300);

  return (
    <div className="space-y-6">
      <PageHeader title={t("list.title")} description={t("list.description")} />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={t("list.search")}
        onReset={() => {
          setSearch("");
          setStatus("all");
          setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
        }}
      >
        <Select value={status} onValueChange={(v) => setStatus(v as UserStatus | "all")}>
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
          search={debounced}
          status={status}
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
