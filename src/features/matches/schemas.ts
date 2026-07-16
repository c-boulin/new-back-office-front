import { z } from "zod";

export const rawMatchSchema = z.object({
  id: z.string(),
  user_a_name: z.string(),
  user_a_id: z.string(),
  user_a_avatar_url: z.string().nullable(),
  user_b_name: z.string(),
  user_b_id: z.string(),
  user_b_avatar_url: z.string().nullable(),
  matched_at: z.string(),
  first_message_at: z.string().nullable(),
  conversation_length: z.number().int().nonnegative(),
  is_active: z.boolean(),
});

export const rawPaginatedMatchesSchema = z.object({
  items: z.array(rawMatchSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export type RawMatch = z.infer<typeof rawMatchSchema>;
export type RawPaginatedMatches = z.infer<typeof rawPaginatedMatchesSchema>;
