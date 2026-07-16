import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawPaginatedReportsSchema } from "./schemas";
import { paginatedReportsFromRaw } from "./adaptors";
import type { PaginatedReports, ReportsQuery } from "./types";

export async function listReports(query: ReportsQuery): Promise<PaginatedReports> {
  const { data } = await httpClient.get("/reports", {
    params: {
      status: query.status && query.status !== "all" ? query.status : undefined,
      reason: query.reason && query.reason !== "all" ? query.reason : undefined,
      search: query.search || undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, rawPaginatedReportsSchema, paginatedReportsFromRaw);
}

export async function resolveReport(id: string): Promise<void> {
  await httpClient.post(`/reports/${id}/resolve`);
}

export async function dismissReport(id: string): Promise<void> {
  await httpClient.post(`/reports/${id}/dismiss`);
}

export async function investigateReport(id: string): Promise<void> {
  await httpClient.post(`/reports/${id}/investigate`);
}
