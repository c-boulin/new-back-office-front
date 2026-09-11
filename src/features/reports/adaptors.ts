import { sanitizeText } from "@/lib/sanitize";
import type { PaginatedReports, Report } from "./types";
import type { RawPaginatedReports, RawReport } from "./schemas";

export function reportFromRaw(raw: RawReport): Report {
  return {
    id: raw.id,
    reporterName: sanitizeText(raw.reporter_name),
    reporterId: raw.reporter_id,
    subjectName: sanitizeText(raw.subject_name),
    subjectId: raw.subject_id,
    category: raw.category,
    status: raw.status,
    description: sanitizeText(raw.description),
    createdAt: raw.created_at,
    resolvedAt: raw.resolved_at,
    resolverName: raw.resolver_name ? sanitizeText(raw.resolver_name) : raw.resolver_name,
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
