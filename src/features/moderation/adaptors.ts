import type { ModerationItem, PaginatedModeration } from "./types";
import type { RawModerationItem, RawPaginatedModeration } from "./schemas";

export function moderationItemFromRaw(raw: RawModerationItem): ModerationItem {
  return {
    id: raw.id,
    userId: raw.user_id,
    userDisplayName: raw.user_display_name,
    userAvatarUrl: raw.user_avatar_url,
    type: raw.type,
    content: raw.content,
    reason: raw.reason,
    status: raw.status,
    reportedAt: raw.reported_at,
    reviewedAt: raw.reviewed_at,
    reviewedBy: raw.reviewed_by,
  };
}

export function paginatedModerationFromRaw(raw: RawPaginatedModeration): PaginatedModeration {
  return {
    items: raw.items.map(moderationItemFromRaw),
    total: raw.total,
    page: raw.page,
    pageSize: raw.page_size,
  };
}
