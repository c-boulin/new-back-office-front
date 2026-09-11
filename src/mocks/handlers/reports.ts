import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawPaginatedReports } from "@/features/reports/schemas";

type Params = Record<string, string | undefined>;

function requireTenant(tenantId: string | null): string {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return tenantId;
}

export function list(tenantId: string | null, params: Params): RawPaginatedReports {
  const scope = requireTenant(tenantId);
  const status = params.status;
  const category = params.category;
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = db.reportsFor(scope).filter((r) => {
    if (status && status !== "all" && r.status !== status) return false;
    if (category && category !== "all" && r.category !== category) return false;
    return true;
  });
  const start = page * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    page_size: pageSize,
  };
}

export function resolve(tenantId: string | null, id: string): { ok: true } {
  const scope = requireTenant(tenantId);
  const next = db.updateReport(scope, id, {
    status: "resolved",
    resolved_at: new Date().toISOString(),
    resolver_name: "Operator",
  });
  if (!next) throw new AppError("not_found", "Report not found", 404);
  return { ok: true };
}

export function dismiss(tenantId: string | null, id: string, reason: string): { ok: true } {
  const scope = requireTenant(tenantId);
  const next = db.updateReport(scope, id, {
    status: "dismissed",
    resolved_at: new Date().toISOString(),
    resolver_name: "Operator",
    description: reason,
  });
  if (!next) throw new AppError("not_found", "Report not found", 404);
  return { ok: true };
}
