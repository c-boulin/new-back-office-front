import { sanitizeText } from "@/lib/sanitize";
import { LEGACY_COLOR_MAP, DEFAULT_ROLE_COLOR } from "@/features/permissions/types";
import type { BoUser, PaginatedBoUsers } from "./types";
import type { RawBoUser, RawPaginatedBoUsers } from "./schemas";

const HEX_RE = /^#[\da-f]{6}$/i;

function toHexColor(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_ROLE_COLOR;
  if (HEX_RE.test(value)) return value;
  return LEGACY_COLOR_MAP[value] ?? DEFAULT_ROLE_COLOR;
}

function computeInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function boUserFromRaw(raw: RawBoUser): BoUser {
  const name = sanitizeText(raw.name ?? "");
  const initials = raw.initials && raw.initials.trim() ? raw.initials.trim() : computeInitials(name);
  return {
    id: Number(raw.id),
    name,
    email: sanitizeText(raw.email ?? ""),
    initials: sanitizeText(initials),
    lastLogin: raw.lastLogin ?? null,
    products: (raw.products ?? []).map((product) => ({
      id: Number(product.id),
      name: sanitizeText(product.name ?? ""),
      slug: product.slug ?? null,
      role: {
        id: String(product.role.id),
        name: sanitizeText(product.role.name ?? ""),
        color: toHexColor(product.role.color),
      },
    })),
  };
}

export function paginatedBoUsersFromRaw(raw: RawPaginatedBoUsers): PaginatedBoUsers {
  return {
    items: raw.data.map(boUserFromRaw),
    pageIndex: Math.max(0, raw.meta.current_page - 1),
    pageCount: Math.max(1, raw.meta.last_page),
    perPage: raw.meta.per_page,
    total: raw.meta.total,
  };
}
