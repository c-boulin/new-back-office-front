import { useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import { DataTable } from "@/components/common/DataTable";
import type { AuditEvent } from "@/features/audit/types";
import { useTranslation } from "react-i18next";

function formatAction(action: string): string {
  const formatted = action.replace(/\./g, " ");
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export type AuditTableProps = {
  data: AuditEvent[];
  total: number;
  pageSize: number;
  pagination: PaginationState;
  onPaginationChange: Dispatch<SetStateAction<PaginationState>>;
};

export function AuditTable({
  data,
  total,
  pageSize,
  pagination,
  onPaginationChange,
}: AuditTableProps) {
  const { t } = useTranslation("audit");

  const columns = useMemo<ColumnDef<AuditEvent, unknown>[]>(
    () => [
      {
        accessorKey: "actorName",
        header: t("columns.actor"),
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "action",
        header: t("columns.action"),
        cell: ({ getValue }) => formatAction(getValue<string>()),
      },
      {
        accessorKey: "entityLabel",
        header: t("columns.entity"),
      },
      {
        accessorKey: "occurredAt",
        header: t("columns.occurredAt"),
        cell: ({ getValue }) =>
          formatDistanceToNow(new Date(getValue<string>()), { addSuffix: true }),
      },
    ],
    [t],
  );

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <DataTable<AuditEvent>
      columns={columns}
      data={data}
      serverPagination={{
        pagination,
        onPaginationChange,
        pageCount,
      }}
      emptyTitle={t("empty.title")}
      emptyDescription={t("empty.description")}
      getRowId={(row) => row.id}
    />
  );
}
