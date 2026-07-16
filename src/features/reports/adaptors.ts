import type { Report, PaginatedReports } from "./types";
import type { RawReport, RawPaginatedReports } from "./schemas";

export function reportFromRaw(raw: RawReport): Report {
  return {
    id: raw.id,
    reporterName: raw.reporter_name,
    reporterId: raw.reporter_id,
    targetName: raw.target_name,
    targetId: raw.target_id,
    reason: raw.reason,
    description: raw.description,
    status: raw.status,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    resolvedBy: raw.resolved_by,
  };
}

export function paginatedReportsFromRaw(raw: RawPaginatedReports): PaginatedReports {
  return {
    items: raw.items.map(reportFromRaw),
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
  };
}
