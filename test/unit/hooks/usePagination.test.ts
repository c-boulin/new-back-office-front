import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePagination } from "@/hooks/usePagination";

describe("usePagination", () => {
  it("defaults to pageIndex 0 and pageSize 20", () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 20 });
  });

  it("respects initial values", () => {
    const { result } = renderHook(() =>
      usePagination({ pageIndex: 2, pageSize: 50 }),
    );
    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 50 });
  });

  it("updates pagination via setPagination", () => {
    const { result } = renderHook(() => usePagination());
    act(() => {
      result.current.setPagination({ pageIndex: 1, pageSize: 10 });
    });
    expect(result.current.pagination).toEqual({ pageIndex: 1, pageSize: 10 });
  });
});
