import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { DataTable } from "@/components/common/DataTable";
import { DataList } from "@/components/common/DataList";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { sanitizeText } from "@/lib/sanitize";
import { listPlatformAdmins } from "@/features/superAdmin/api";
import type { PlatformAdmin, PlatformAdminRole } from "@/features/superAdmin/types";

const ROLE_VARIANT: Record<PlatformAdminRole, "default" | "secondary" | "success"> = {
  owner: "success",
  admin: "default",
  read_only: "secondary",
};

export type PlatformAdminsListProps = {
  role: PlatformAdminRole | "all";
};

export function PlatformAdminsList({ role }: PlatformAdminsListProps) {
  const { t } = useTranslation("superAdmin");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data } = useSuspenseQuery({
    queryKey: ["super-admin", "admins"],
    queryFn: listPlatformAdmins,
  });

  const rows = useMemo(
    () => (role === "all" ? data : data.filter((admin) => admin.role === role)),
    [data, role],
  );

  const columns: ColumnDef<PlatformAdmin, unknown>[] = [
    {
      id: "name",
      header: t("admins.columns.name"),
      cell: ({ row }) => (
        <span className="font-medium">{sanitizeText(row.original.name)}</span>
      ),
    },
    {
      id: "email",
      header: t("admins.columns.email"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {sanitizeText(row.original.email)}
        </span>
      ),
    },
    {
      id: "role",
      header: t("admins.columns.role"),
      cell: ({ row }) => (
        <Badge variant={ROLE_VARIANT[row.original.role]}>
          {t(`admins.roles.${row.original.role}`)}
        </Badge>
      ),
    },
    {
      id: "lastActive",
      header: t("admins.columns.lastActive"),
      cell: ({ row }) =>
        row.original.lastActiveAt
          ? format(new Date(row.original.lastActiveAt), "MMM d, yyyy")
          : "—",
    },
    {
      id: "createdAt",
      header: t("admins.columns.createdAt"),
      cell: ({ row }) => format(new Date(row.original.createdAt), "MMM d, yyyy"),
    },
  ];

  if (isMobile) {
    return (
      <DataList
        items={rows}
        getKey={(item) => item.id}
        emptyTitle={t("admins.empty.title")}
        emptyDescription={t("admins.empty.description")}
        renderCard={(admin) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{sanitizeText(admin.name)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {sanitizeText(admin.email)}
                </p>
              </div>
              <Badge variant={ROLE_VARIANT[admin.role]}>
                {t(`admins.roles.${admin.role}`)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {admin.lastActiveAt
                ? `${t("admins.columns.lastActive")}: ${format(new Date(admin.lastActiveAt), "MMM d, yyyy")}`
                : t("admins.columns.lastActive")}
            </p>
          </div>
        )}
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      emptyTitle={t("admins.empty.title")}
      emptyDescription={t("admins.empty.description")}
    />
  );
}
