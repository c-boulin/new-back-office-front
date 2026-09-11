import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawPaginatedUsers, RawUserRecord } from "@/features/users/schemas";

type Params = Record<string, string | undefined>;

function requireTenant(tenantId: string | null): string {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return tenantId;
}

export function list(tenantId: string | null, params: Params): RawPaginatedUsers {
  const scope = requireTenant(tenantId);
  const search = (params.search ?? "").trim().toLowerCase();
  const status = params.status;
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = db.usersFor(scope).filter((u) => {
    if (status && status !== "all" && u.status !== status) return false;
    if (!search) return true;
    return (
      u.display_name.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search) ||
      (u.city?.toLowerCase().includes(search) ?? false)
    );
  });

  const start = page * pageSize;
  const items = filtered.slice(start, start + pageSize);
  return { items, total: filtered.length, page, page_size: pageSize };
}

function update(
  tenantId: string | null,
  id: string,
  patch: Partial<RawUserRecord>,
): RawUserRecord {
  const scope = requireTenant(tenantId);
  const next = db.updateUser(scope, id, patch);
  if (!next) throw new AppError("not_found", "User not found", 404);
  return next;
}

export function ban(tenantId: string | null, id: string): RawUserRecord {
  return update(tenantId, id, { status: "banned" });
}

export function unban(tenantId: string | null, id: string): RawUserRecord {
  return update(tenantId, id, { status: "active" });
}

export function verify(tenantId: string | null, id: string): RawUserRecord {
  return update(tenantId, id, { is_verified: true, status: "active" });
}
