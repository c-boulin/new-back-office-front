import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import type { Dispatch, SetStateAction } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export type ServerPagination = {
  pagination: PaginationState;
  onPaginationChange: Dispatch<SetStateAction<PaginationState>>;
  pageCount: number;
};

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  emptyTitle?: string;
  emptyDescription?: string;
  sorting?: SortingState;
  onSortingChange?: Dispatch<SetStateAction<SortingState>>;
  serverPagination?: ServerPagination;
  getRowId?: (row: TData) => string;
};

export function DataTable<TData>({
  columns,
  data,
  emptyTitle,
  emptyDescription,
  sorting,
  onSortingChange,
  serverPagination,
  getRowId,
}: DataTableProps<TData>) {
  const { t } = useTranslation("common");
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: sorting ?? [],
      pagination: serverPagination?.pagination,
    },
    onSortingChange,
    onPaginationChange: serverPagination?.onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: Boolean(serverPagination),
    manualSorting: Boolean(onSortingChange),
    pageCount: serverPagination?.pageCount ?? undefined,
    getRowId,
  });

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle ?? t("empty.title")}
        description={emptyDescription ?? t("empty.description")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    // TanStack Table exposes column widths as runtime pixel values via
                    // getSize(); inline style is the library's canonical wire-up and is
                    // not a design token, so BEST_PRACTICES §5 does not apply here.
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {serverPagination ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("pagination.page", {
              page: serverPagination.pagination.pageIndex + 1,
              total: Math.max(serverPagination.pageCount, 1),
            })}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
              {t("pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t("pagination.next")}
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
