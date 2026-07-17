import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawPaginatedModeration } from "@/features/moderation/schemas";

type Params = Record<string, string | undefined>;

function requireTenant(tenantId: string | null): string {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return tenantId;
}

export function list(tenantId: string | null, params: Params): RawPaginatedModeration {
  const scope = requireTenant(tenantId);
  const status = params.status;
  const type = params.type;
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = db.moderationFor(scope).filter((m) => {
    if (status && status !== "all" && m.status !== status) return false;
    if (type && type !== "all" && m.type !== type) return false;
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

export function approve(tenantId: string | null, id: string): { ok: true } {
  const scope = requireTenant(tenantId);
  const next = db.updateModeration(scope, id, { status: "approved" });
  if (!next) throw new AppError("not_found", "Moderation item not found", 404);
  return { ok: true };
}

export function reject(tenantId: string | null, id: string, reason: string): { ok: true } {
  const scope = requireTenant(tenantId);
  const next = db.updateModeration(scope, id, { status: "rejected", reason });
  if (!next) throw new AppError("not_found", "Moderation item not found", 404);
  return { ok: true };
}

export function escalate(tenantId: string | null, id: string): { ok: true } {
  const scope = requireTenant(tenantId);
  const next = db.updateModeration(scope, id, { status: "escalated" });
  if (!next) throw new AppError("not_found", "Moderation item not found", 404);
  return { ok: true };
}
