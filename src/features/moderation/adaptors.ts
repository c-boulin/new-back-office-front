import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";
import type {
  ModerationContentKind,
  ModerationItem,
  ModerationItemType,
  ModerationStats,
  PaginatedModeration,
} from "./types";
import type {
  RawModerationItem,
  RawModerationStats,
  RawPaginatedModeration,
} from "./schemas";

const KIND_FROM_TYPE: Record<ModerationItemType, ModerationContentKind> = {
  profile: "nickname",
  photo: "profile_photo",
  message: "message",
  report: "message",
};

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
    aiDecision: raw.ai_decision ?? "unknown",
    contentKind: raw.content_kind ?? KIND_FROM_TYPE[raw.type],
    contentPreview: raw.content_preview ? sanitizeText(raw.content_preview) : null,
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

export function moderationStatsFromRaw(raw: RawModerationStats): ModerationStats {
  return {
    totalProcessed: raw.total_processed,
    pending: raw.pending,
    confirmed: raw.confirmed,
    reverted: raw.reverted,
    aiRefused: raw.ai_refused,
    aiAccepted: raw.ai_accepted,
  };
}
