import { useDeferredValue } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { DataList } from "@/components/common/DataList";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listBoUsers } from "@/features/boUsers/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { RoleColor } from "@/features/permissions/types";
import type { BoUser } from "@/features/boUsers/types";

const COLOR_VARIANT: Record<RoleColor, NonNullable<BadgeProps["variant"]>> = {
  error: "destructive",
  warning: "warning",
  info: "secondary",
  success: "success",
  primary: "default",
  secondary: "secondary",
};

function AssignmentChips({ user, empty }: { user: BoUser; empty: string }) {
  if (user.products.length === 0) {
    return <span className="text-sm text-muted-foreground">{empty}</span>;
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {user.products.map((product) => (
        <Badge key={product.id} variant={COLOR_VARIANT[product.role.color]} className="gap-1">
          <span className="font-normal opacity-80">{product.name}</span>
          <span aria-hidden>·</span>
          <span>{product.role.name}</span>
        </Badge>
      ))}
    </div>
  );
}

export type BoUsersTableProps = {
  pagination: PaginationState;
  onPaginationChange: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  onEdit: (user: BoUser) => void;
  onDelete: (user: BoUser) => void;
  canUpdate: boolean;
  canDelete: boolean;
};

export function BoUsersTable({
  pagination,
  onPaginationChange,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
}: BoUsersTableProps) {
  const { t } = useTranslation("boUsers");
  const { id: tenantId } = useActiveTenant();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const deferredPagination = useDeferredValue(pagination);

  const { data } = useSuspenseQuery({
    queryKey: [
      "tenant",
      tenantId,
      "bo-users",
      "list",
      { page: deferredPagination.pageIndex, perPage: deferredPagination.pageSize },
    ],
    queryFn: () =>
      listBoUsers({
        page: deferredPagination.pageIndex + 1,
        perPage: deferredPagination.pageSize,
      }),
  });

  const formatLogin = (value: string | null) =>
    value ? new Date(value).toLocaleDateString() : t("never");

  const rowActions = (user: BoUser) => (
    <div className="flex items-center justify-end gap-1">
      {canUpdate ? (
        <Button size="sm" variant="ghost" onClick={() => onEdit(user)}>
          <Pencil />
          {t("actions.edit")}
        </Button>
      ) : null}
      {canDelete ? (
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(user)}
        >
          <Trash2 />
          {t("actions.delete")}
        </Button>
      ) : null}
    </div>
  );

  if (isMobile) {
    return (
      <DataList
        items={data.items}
        getKey={(item) => String(item.id)}
        emptyTitle={t("list.empty.title")}
        emptyDescription={t("list.empty.description")}
        serverPagination={{ pagination, onPaginationChange, pageCount: data.pageCount }}
        renderCard={(user) => (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{user.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <AssignmentChips user={user} empty={t("noAssignments")} />
            <p className="text-xs text-muted-foreground">
              {t("columns.lastLogin")}: {formatLogin(user.lastLogin)}
            </p>
            {canUpdate || canDelete ? rowActions(user) : null}
          </div>
        )}
      />
    );
  }

  const columns: ColumnDef<BoUser, unknown>[] = [
    {
      id: "user",
      header: t("columns.user"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{row.original.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "products",
      header: t("columns.products"),
      cell: ({ row }) => <AssignmentChips user={row.original} empty={t("noAssignments")} />,
    },
    {
      id: "lastLogin",
      header: t("columns.lastLogin"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatLogin(row.original.lastLogin)}
        </span>
      ),
    },
    {
      id: "actions",
      header: t("columns.actions"),
      cell: ({ row }) => rowActions(row.original),
    },
  ];

  return (
    <DataTable<BoUser>
      columns={columns}
      data={data.items}
      serverPagination={{ pagination, onPaginationChange, pageCount: data.pageCount }}
      emptyTitle={t("list.empty.title")}
      emptyDescription={t("list.empty.description")}
      getRowId={(row) => String(row.id)}
    />
  );
}
