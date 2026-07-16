import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";

export function usePagination(initial?: Partial<PaginationState>) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initial?.pageIndex ?? 0,
    pageSize: initial?.pageSize ?? 20,
  });
  return { pagination, setPagination };
}
