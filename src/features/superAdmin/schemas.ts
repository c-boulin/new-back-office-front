import { z } from "zod";

export const platformAdminSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["owner", "admin", "read_only"]),
  last_active_at: z.string().nullable(),
  created_at: z.string(),
});

export const platformAdminListSchema = z.object({
  items: z.array(platformAdminSchema),
  total: z.number().int().nonnegative(),
});

export type RawPlatformAdmin = z.infer<typeof platformAdminSchema>;
export type RawPlatformAdminList = z.infer<typeof platformAdminListSchema>;
