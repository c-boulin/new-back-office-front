import { z } from "zod";

export const userRecordSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().nullable(),
  status: z.enum(["active", "banned", "shadow_banned", "unverified", "deleted"]),
  is_verified: z.boolean(),
  is_premium: z.boolean(),
  report_count: z.number().int().nonnegative(),
  matches_count: z.number().int().nonnegative(),
  created_at: z.string(),
  last_active_at: z.string().nullable(),
  city: z.string().nullable(),
  country: z.string().nullable(),
});

export const paginatedUsersSchema = z.object({
  items: z.array(userRecordSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export type RawUserRecord = z.infer<typeof userRecordSchema>;
export type RawPaginatedUsers = z.infer<typeof paginatedUsersSchema>;
