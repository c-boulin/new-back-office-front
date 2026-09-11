import { z } from "zod";

export const moderationItemSchema = z.object({
  id: z.string(),
  type: z.enum(["profile", "photo", "message", "report"]),
  status: z.enum(["pending", "approved", "rejected", "escalated"]),
  reason: z.string(),
  reported_by: z.string().nullable(),
  subject_name: z.string(),
  subject_id: z.string(),
  content: z.string(),
  content_html: z.string().nullable(),
  image_url: z.string().nullable(),
  severity: z.enum(["low", "medium", "high"]),
  created_at: z.string(),
  ai_decision: z.enum(["accepted", "refused", "unknown"]).optional(),
  content_kind: z.enum(["nickname", "profile_photo", "story", "message"]).optional(),
  content_preview: z.string().nullable().optional(),
});

export const paginatedModerationSchema = z.object({
  items: z.array(moderationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export const moderationStatsSchema = z.object({
  total_processed: z.number().int().nonnegative(),
  pending: z.number().int().nonnegative(),
  confirmed: z.number().int().nonnegative(),
  reverted: z.number().int().nonnegative(),
  ai_refused: z.number().int().nonnegative(),
  ai_accepted: z.number().int().nonnegative(),
});

export type RawModerationItem = z.infer<typeof moderationItemSchema>;
export type RawPaginatedModeration = z.infer<typeof paginatedModerationSchema>;
export type RawModerationStats = z.infer<typeof moderationStatsSchema>;
