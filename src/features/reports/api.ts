import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { paginatedReportsSchema } from "./schemas";
import { paginatedReportsFromRaw } from "./adaptors";
import type { PaginatedReports, ReportsQuery } from "./types";

export async function listReports(query: ReportsQuery): Promise<PaginatedReports> {
  const { data } = await httpClient.get("/reports", {
    params: {
      status: query.status && query.status !== "all" ? query.status : undefined,
      category: query.category && query.category !== "all" ? query.category : undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, paginatedReportsSchema, paginatedReportsFromRaw);
}

export async function resolveReport(id: string): Promise<void> {
  await httpClient.post(`/reports/${id}/resolve`);
}

export async function dismissReport(id: string, reason: string): Promise<void> {
  await httpClient.post(`/reports/${id}/dismiss`, { reason });
}
