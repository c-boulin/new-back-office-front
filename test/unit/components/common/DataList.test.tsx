import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataList } from "@/components/common/DataList";
import { renderWithProviders } from "@test/utils/renderWithProviders";

type Row = { id: string; label: string };

describe("DataList", () => {
  it("renders EmptyState when items is empty", () => {
    renderWithProviders(
      <DataList<Row>
        items={[]}
        getKey={(r) => r.id}
        renderCard={(r) => <span>{r.label}</span>}
        emptyTitle="Nothing here"
        emptyDescription="Try later"
      />,
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try later")).toBeInTheDocument();
  });

  it("renders one card per item", () => {
    renderWithProviders(
      <DataList<Row>
        items={[
          { id: "a", label: "Card A" },
          { id: "b", label: "Card B" },
        ]}
        getKey={(r) => r.id}
        renderCard={(r) => <span>{r.label}</span>}
      />,
    );
    expect(screen.getByText("Card A")).toBeInTheDocument();
    expect(screen.getByText("Card B")).toBeInTheDocument();
  });

  it("pagination advances via onPaginationChange updater", async () => {
    const onPaginationChange = vi.fn();
    renderWithProviders(
      <DataList<Row>
        items={[{ id: "a", label: "A" }]}
        getKey={(r) => r.id}
        renderCard={(r) => <span>{r.label}</span>}
        serverPagination={{
          pagination: { pageIndex: 0, pageSize: 10 },
          onPaginationChange,
          pageCount: 2,
        }}
      />,
    );
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPaginationChange).toHaveBeenCalledOnce();
    const updater = onPaginationChange.mock.calls[0][0] as (
      p: { pageIndex: number; pageSize: number },
    ) => { pageIndex: number; pageSize: number };
    expect(updater({ pageIndex: 0, pageSize: 10 })).toEqual({ pageIndex: 1, pageSize: 10 });
  });
});
