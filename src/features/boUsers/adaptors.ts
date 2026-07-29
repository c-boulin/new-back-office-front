import { sanitizeText } from "@/lib/sanitize";
import { roleColorSchema } from "@/features/permissions/schemas";
import type { RoleColor } from "@/features/permissions/types";
import type { BoUser, PaginatedBoUsers } from "./types";
import type { RawBoUser, RawPaginatedBoUsers } from "./schemas";

function toRoleColor(value: unknown): RoleColor {
  const parsed = roleColorSchema.safeParse(value);
  return parsed.success ? parsed.data : "secondary";
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
        color: toRoleColor(product.role.color),
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
