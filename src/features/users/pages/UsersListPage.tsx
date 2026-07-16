import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/common/PageHeader";
import { FilterBar } from "@/components/common/FilterBar";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { DataTable } from "@/components/common/DataTable";
import { UsersTableColumns } from "@/features/users/components/UsersTableColumns";
import { UserDetailSheet } from "@/features/users/components/UserDetailSheet";
import { listUsers } from "@/features/users/api";
import { useDebounce } from "@/hooks/useDebounce";
import { useActiveTenant } from "@/hooks/useActiveTenant";
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
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();
  const { pagination, setPagination } = usePagination({ pageSize: 20 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [selected, setSelected] = useState<UserRecord | null>(null);

  const debounced = useDebounce(search, 300);

  const query = useQuery({
    queryKey: [
      "tenant",
      tenantId,
      "users",
      "list",
      { search: debounced, status, page: pagination.pageIndex, pageSize: pagination.pageSize },
    ],
    queryFn: () =>
      listUsers({
        search: debounced,
        status,
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
      }),
    enabled: Boolean(tenantId),
    placeholderData: (prev) => prev,
  });

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

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <DataTable<UserRecord>
          columns={UsersTableColumns({
            onView: (user) => setSelected(user),
            translations: {
              user: t("list.columns.user"),
              status: t("list.columns.status"),
              reports: t("list.columns.reports"),
              matches: t("list.columns.matches"),
              joined: t("list.columns.joined"),
              lastActive: t("list.columns.lastActive"),
              actions: t("list.columns.actions"),
              view: t("actions.view"),
              statuses: {
                active: t("status.active"),
                banned: t("status.banned"),
                shadow_banned: t("status.shadow_banned"),
                unverified: t("status.unverified"),
                deleted: t("status.deleted"),
              },
            },
          })}
          data={query.data.items}
          serverPagination={{
            pagination,
            onPaginationChange: setPagination,
            pageCount: Math.max(1, Math.ceil(query.data.total / query.data.pageSize)),
          }}
          emptyTitle={tCommon("empty.title")}
          emptyDescription={tCommon("empty.description")}
          getRowId={(row) => row.id}
        />
      )}

      <UserDetailSheet
        user={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
