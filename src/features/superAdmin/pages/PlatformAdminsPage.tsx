import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingState } from "@/components/common/LoadingState";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import { sanitizeText } from "@/lib/sanitize";
import { listPlatformAdmins } from "@/features/superAdmin/api";
import type { ColumnDef } from "@tanstack/react-table";
import type { PlatformAdmin, PlatformAdminRole } from "@/features/superAdmin/types";

const ROLE_VARIANT: Record<PlatformAdminRole, "default" | "secondary" | "success"> = {
  owner: "success",
  admin: "default",
  read_only: "secondary",
};

export function PlatformAdminsPage() {
  const { t } = useTranslation("superAdmin");
  const query = useQuery({
    queryKey: ["superAdmin", "admins"],
    queryFn: listPlatformAdmins,
  });

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
        <span className="text-sm text-muted-foreground">{sanitizeText(row.original.email)}</span>
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

  return (
    <div className="space-y-6">
      <PageHeader title={t("admins.title")} description={t("admins.description")} />

      {query.isPending ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState onRetry={() => void query.refetch()} />
      ) : query.data.length === 0 ? (
        <EmptyState
          title={t("admins.empty.title")}
          description={t("admins.empty.description")}
        />
      ) : (
        <DataTable
          columns={columns}
          data={query.data}
          getRowId={(row) => row.id}
          emptyTitle={t("admins.empty.title")}
          emptyDescription={t("admins.empty.description")}
        />
      )}
    </div>
  );
}
