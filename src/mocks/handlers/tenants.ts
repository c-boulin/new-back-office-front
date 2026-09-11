import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawTenant } from "@/features/tenants/schemas";

export function list(): { items: RawTenant[]; total: number } {
  const items = db.tenants;
  return { items, total: items.length };
}

export function byId(id: string): RawTenant {
  const match = db.tenants.find((t) => t.id === id);
  if (!match) throw new AppError("not_found", "Tenant not found", 404);
  return match;
}
