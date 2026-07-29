import { useMemo } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Lock, Pencil, Trash2 } from "lucide-react";
import { DataTable } from "@/components/common/DataTable";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listRoles } from "@/features/permissions/api";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import type { Role, RoleColor } from "@/features/permissions/types";

const COLOR_VARIANT: Record<RoleColor, NonNullable<BadgeProps["variant"]>> = {
  error: "destructive",
  warning: "warning",
  info: "secondary",
  success: "success",
  primary: "default",
  secondary: "secondary",
};

export type RolesTableProps = {
  onOpen: (role: Role) => void;
  onDelete: (role: Role) => void;
};

export function RolesTable({ onOpen, onDelete }: RolesTableProps) {
  const { t } = useTranslation("roles");
  const { id: tenantId } = useActiveTenant();

  const { data } = useSuspenseQuery({
    queryKey: ["tenant", tenantId, "roles"],
    queryFn: listRoles,
  });

  const columns = useMemo<ColumnDef<Role, unknown>[]>(
    () => [
      {
        id: "label",
        header: t("columns.label"),
        cell: ({ row }) => <span className="font-medium">{row.original.label}</span>,
      },
      {
        id: "color",
        header: t("columns.color"),
        cell: ({ row }) => (
          <Badge variant={COLOR_VARIANT[row.original.color]}>
            {t(`colors.${row.original.color}`)}
          </Badge>
        ),
      },
      {
        id: "status",
        header: t("columns.status"),
        cell: ({ row }) =>
          row.original.isLocked ? (
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Lock className="h-3.5 w-3.5" aria-hidden />
              {t("locked")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">{t("editable")}</span>
          ),
      },
      {
        id: "created",
        header: t("columns.created"),
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : "—",
      },
      {
        id: "actions",
        header: t("columns.actions"),
        cell: ({ row }) => {
          const role = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button size="sm" variant="ghost" onClick={() => onOpen(role)}>
                {role.isLocked ? <Eye /> : <Pencil />}
                {role.isLocked ? t("actions.view") : t("actions.edit")}
              </Button>
              {role.isLocked ? null : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(role)}
                >
                  <Trash2 />
                  {t("actions.delete")}
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [t, onOpen, onDelete],
  );

  return (
    <DataTable<Role>
      columns={columns}
      data={data}
      emptyTitle={t("empty.title")}
      emptyDescription={t("empty.description")}
      getRowId={(row) => row.id}
    />
  );
}
