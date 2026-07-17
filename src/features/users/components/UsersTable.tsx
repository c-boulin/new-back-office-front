import { useDeferredValue } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/common/DataTable";
import { UsersTableColumns } from "./UsersTableColumns";
import { listUsers } from "@/features/users/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { PaginationState } from "@tanstack/react-table";
import type { UserRecord, UserStatus } from "@/features/users/types";

export type UsersTableProps = {
  search: string;
  status: UserStatus | "all";
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  onView: (user: UserRecord) => void;
};

export function UsersTable({
  search,
  status,
  pagination,
  onPaginationChange,
  onView,
}: UsersTableProps) {
  const { t } = useTranslation("users");
  const { t: tCommon } = useTranslation("common");
  const { id: tenantId } = useActiveTenant();

  const deferredSearch = useDeferredValue(search);
  const deferredStatus = useDeferredValue(status);
  const deferredPagination = useDeferredValue(pagination);

  const { data } = useSuspenseQuery({
    queryKey: [
      "tenant",
      tenantId,
      "users",
      "list",
      {
        search: deferredSearch,
        status: deferredStatus,
        page: deferredPagination.pageIndex,
        pageSize: deferredPagination.pageSize,
      },
    ],
    queryFn: () =>
      listUsers({
        search: deferredSearch,
        status: deferredStatus,
        page: deferredPagination.pageIndex,
        pageSize: deferredPagination.pageSize,
      }),
  });

  return (
    <DataTable<UserRecord>
      columns={UsersTableColumns({
        onView,
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
      data={data.items}
      serverPagination={{
        pagination,
        onPaginationChange,
        pageCount: Math.max(1, Math.ceil(data.total / data.pageSize)),
      }}
      emptyTitle={tCommon("empty.title")}
      emptyDescription={tCommon("empty.description")}
      getRowId={(row) => row.id}
    />
  );
}
