import { useDeferredValue } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/common/DataTable";
import { DataList } from "@/components/common/DataList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { UsersTableColumns } from "./UsersTableColumns";
import { listUsers } from "@/features/users/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { sanitizeText } from "@/lib/sanitize";
import type { PaginationState } from "@tanstack/react-table";
import type { UserRecord, UserStatus } from "@/features/users/types";

const STATUS_VARIANT: Record<
  UserStatus,
  "default" | "secondary" | "destructive" | "warning" | "success"
> = {
  active: "success",
  banned: "destructive",
  shadow_banned: "warning",
  unverified: "secondary",
  deleted: "secondary",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
  const isMobile = useMediaQuery("(max-width: 768px)");

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

  const pageCount = Math.max(1, Math.ceil(data.total / data.pageSize));

  if (isMobile) {
    return (
      <DataList
        items={data.items}
        getKey={(item) => item.id}
        emptyTitle={tCommon("empty.title")}
        emptyDescription={tCommon("empty.description")}
        serverPagination={{ pagination, onPaginationChange, pageCount }}
        renderCard={(user) => (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-10 w-10">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                  <AvatarFallback>{initials(user.displayName)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{sanitizeText(user.displayName)}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {sanitizeText(user.email)}
                  </p>
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[user.status]}>{t(`status.${user.status}`)}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p
                  className={
                    user.reportCount > 0
                      ? "text-base font-semibold text-destructive"
                      : "text-base font-semibold"
                  }
                >
                  {user.reportCount}
                </p>
                <p className="text-muted-foreground">{t("list.columns.reports")}</p>
              </div>
              <div>
                <p className="text-base font-semibold">{user.matchesCount}</p>
                <p className="text-muted-foreground">{t("list.columns.matches")}</p>
              </div>
              <div>
                <p className="text-base font-semibold">
                  {user.lastActiveAt
                    ? new Date(user.lastActiveAt).toLocaleDateString()
                    : "—"}
                </p>
                <p className="text-muted-foreground">{t("list.columns.lastActive")}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onView(user)}
            >
              <Eye />
              {t("actions.view")}
            </Button>
          </div>
        )}
      />
    );
  }

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
      serverPagination={{ pagination, onPaginationChange, pageCount }}
      emptyTitle={tCommon("empty.title")}
      emptyDescription={tCommon("empty.description")}
      getRowId={(row) => row.id}
    />
  );
}
