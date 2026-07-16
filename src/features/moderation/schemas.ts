import { z } from "zod";

export const rawModerationItemSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  user_display_name: z.string(),
  user_avatar_url: z.string().nullable(),
  type: z.enum(["photo", "bio", "message", "profile"]),
  content: z.string(),
  reason: z.string(),
  status: z.enum(["pending", "approved", "rejected", "escalated"]),
  reported_at: z.string(),
  reviewed_at: z.string().nullable(),
  reviewed_by: z.string().nullable(),
});

export const rawPaginatedModerationSchema = z.object({
  items: z.array(rawModerationItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export type RawModerationItem = z.infer<typeof rawModerationItemSchema>;
export type RawPaginatedModeration = z.infer<typeof rawPaginatedModerationSchema>;
