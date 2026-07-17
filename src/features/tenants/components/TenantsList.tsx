import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/common/DataTable";
import { DataList } from "@/components/common/DataList";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { sanitizeText } from "@/lib/sanitize";
import { listTenants } from "@/features/tenants/api";
import type { Tenant } from "@/features/tenants/types";

const STATUS_VARIANT: Record<Tenant["status"], "success" | "warning" | "secondary"> = {
  active: "success",
  suspended: "warning",
  provisioning: "secondary",
};

export type TenantsListProps = {
  query: string;
  status: Tenant["status"] | "all";
};

export function TenantsList({ query, status }: TenantsListProps) {
  const { t } = useTranslation("tenants");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data } = useSuspenseQuery({
    queryKey: ["super-admin", "tenants"],
    queryFn: listTenants,
  });

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.filter((tenant) => {
      if (status !== "all" && tenant.status !== status) return false;
      if (!needle) return true;
      return (
        tenant.name.toLowerCase().includes(needle) ||
        tenant.slug.toLowerCase().includes(needle)
      );
    });
  }, [data, query, status]);

  const columns: ColumnDef<Tenant, unknown>[] = [
    {
      id: "name",
      header: t("list.columns.name"),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{sanitizeText(row.original.name)}</p>
          <p className="text-xs text-muted-foreground">/{sanitizeText(row.original.slug)}</p>
        </div>
      ),
    },
    {
      id: "status",
      header: t("list.columns.status"),
      cell: ({ row }) => (
        <Badge variant={STATUS_VARIANT[row.original.status]}>
          {t(`status.${row.original.status}`)}
        </Badge>
      ),
    },
    {
      id: "users",
      header: t("list.columns.users"),
      accessorFn: (r) => r.usersCount.toLocaleString(),
    },
    {
      id: "created",
      header: t("list.columns.created"),
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
  ];

  if (isMobile) {
    return (
      <DataList
        items={rows}
        getKey={(item) => item.id}
        emptyTitle={t("list.empty.title")}
        emptyDescription={t("list.empty.description")}
        renderCard={(tenant) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{sanitizeText(tenant.name)}</p>
                <p className="text-xs text-muted-foreground">/{sanitizeText(tenant.slug)}</p>
              </div>
              <Badge variant={STATUS_VARIANT[tenant.status]}>
                {t(`status.${tenant.status}`)}
              </Badge>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("list.columns.users")}: {tenant.usersCount.toLocaleString()}</span>
              <span>{new Date(tenant.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      />
    );
  }

  return (
    <DataTable<Tenant>
      columns={columns}
      data={rows}
      getRowId={(row) => row.id}
      emptyTitle={t("list.empty.title")}
      emptyDescription={t("list.empty.description")}
    />
  );
}

