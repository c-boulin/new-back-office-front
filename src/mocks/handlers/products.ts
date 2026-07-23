import { db } from "../db";
import type { RawProductsResponse } from "@/features/auth/products";

/**
 * Deterministic hex color per tenant slug so the mock exercises the same
 * "server sends #RRGGBB" path the real backend now uses.
 */
const MOCK_HEX_BY_SLUG: Record<string, string> = {
  woozgo: "#3fb28c",
  "weezchat-fr": "#e53e6b",
  "weezchat-ci": "#ee6b1f",
  "toolov-sk": "#199fe0",
  "weezchat-tg": "#f0c419",
  swipi: "#22a89a",
};

export function list(): RawProductsResponse {
  const data = db.tenants
    .filter((t) => t.status === "active")
    .map((t) => ({
      id: Number(t.id),
      name: t.name,
      slug: t.slug,
      color: MOCK_HEX_BY_SLUG[t.slug] ?? null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { data };
}
