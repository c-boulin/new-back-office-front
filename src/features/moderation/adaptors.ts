import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";
import type { ModerationItem, PaginatedModeration } from "./types";
import type { RawModerationItem, RawPaginatedModeration } from "./schemas";

export function moderationItemFromRaw(raw: RawModerationItem): ModerationItem {
  return {
    id: raw.id,
    type: raw.type,
    status: raw.status,
    reason: sanitizeText(raw.reason),
    reportedBy: raw.reported_by ? sanitizeText(raw.reported_by) : raw.reported_by,
    subjectName: sanitizeText(raw.subject_name),
    subjectId: raw.subject_id,
    content: raw.content ? sanitizeText(raw.content) : raw.content,
    contentHtml: raw.content_html ? sanitizeHtml(raw.content_html) : raw.content_html,
    imageUrl: raw.image_url,
    severity: raw.severity,
    createdAt: raw.created_at,
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
