import type { PaginatedUsers, UserRecord } from "./types";
import type { RawPaginatedUsers, RawUserRecord } from "./schemas";

export function userFromRaw(raw: RawUserRecord): UserRecord {
  return {
    id: raw.id,
    displayName: raw.display_name,
    email: raw.email,
    avatarUrl: raw.avatar_url,
    status: raw.status,
    isVerified: raw.is_verified,
    isPremium: raw.is_premium,
    reportCount: raw.report_count,
    matchesCount: raw.matches_count,
    createdAt: raw.created_at,
    lastActiveAt: raw.last_active_at,
    city: raw.city,
    country: raw.country,
  };
}

export function paginatedUsersFromRaw(raw: RawPaginatedUsers): PaginatedUsers {
  return {
    items: raw.items.map(userFromRaw),
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
  };
}
