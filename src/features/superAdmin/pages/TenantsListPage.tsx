import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/common/DataTable";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listTenants } from "@/features/tenants/api";
import type { Tenant } from "@/features/tenants/types";

const STATUS_VARIANT: Record<Tenant["status"], "success" | "warning" | "secondary"> = {
  active: "success",
  suspended: "warning",
  provisioning: "secondary",
};

export function TenantsListPage() {
  const { t } = useTranslation("tenants");

  const query = useQuery({
    queryKey: ["super-admin", "tenants"],
    queryFn: listTenants,
  });

  const columns: ColumnDef<Tenant, unknown>[] = [
    {
      id: "name",
      header: t("list.columns.name"),
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
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

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : (
        <DataTable<Tenant>
          columns={columns}
          data={query.data}
          getRowId={(row) => row.id}
        />
      )}
    </div>
  );
}
