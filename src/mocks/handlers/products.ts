import { db } from "../db";
import type { RawProductsResponse } from "@/features/auth/products";

export function list(): RawProductsResponse {
  const data = db.tenants
    .filter((t) => t.status === "active")
    .map((t) => ({ id: Number(t.id), name: t.name, slug: t.slug }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { data };
}
