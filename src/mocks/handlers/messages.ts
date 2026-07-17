import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawPaginatedMessageThreads } from "@/features/messages/schemas";

type Params = Record<string, string | undefined>;

function requireTenant(tenantId: string | null): string {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return tenantId;
}

export function listThreads(
  tenantId: string | null,
  params: Params,
): RawPaginatedMessageThreads {
  const scope = requireTenant(tenantId);
  const flaggedOnly = params.flagged === "true";
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;
  const filtered = db.threadsFor(scope).filter((t) => (flaggedOnly ? t.flag !== null : true));
  const start = page * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    page_size: pageSize,
  };
}
