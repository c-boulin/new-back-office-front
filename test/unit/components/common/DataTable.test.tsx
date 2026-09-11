import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/common/DataTable";
import { renderWithProviders } from "@test/utils/renderWithProviders";

type Row = { id: string; name: string };

const columns: ColumnDef<Row, unknown>[] = [
  { accessorKey: "name", header: "Name" },
];

describe("DataTable", () => {
  it("renders EmptyState when data is empty", () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[]}
        emptyTitle="No rows"
        emptyDescription="Add one to get started"
      />,
    );
    expect(screen.getByText("No rows")).toBeInTheDocument();
    expect(screen.getByText("Add one to get started")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders header and rows", () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[
          { id: "a", name: "Alice" },
          { id: "b", name: "Bob" },
        ]}
      />,
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("shows server pagination controls and disables prev on first page", async () => {
    const onPaginationChange = vi.fn();
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[{ id: "a", name: "Alice" }]}
        serverPagination={{
          pagination: { pageIndex: 0, pageSize: 10 },
          onPaginationChange,
          pageCount: 3,
        }}
      />,
    );
    const prev = screen.getByRole("button", { name: /previous/i });
    const next = screen.getByRole("button", { name: /next/i });
    expect(prev).toBeDisabled();
    expect(next).not.toBeDisabled();
    await userEvent.click(next);
    expect(onPaginationChange).toHaveBeenCalled();
  });

  it("disables next on the last page", () => {
    renderWithProviders(
      <DataTable
        columns={columns}
        data={[{ id: "a", name: "Alice" }]}
        serverPagination={{
          pagination: { pageIndex: 2, pageSize: 10 },
          onPaginationChange: () => {},
          pageCount: 3,
        }}
      />,
    );
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });
});
