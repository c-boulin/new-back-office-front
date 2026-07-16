import { z } from "zod";

export const rawReportSchema = z.object({
  id: z.string(),
  reporter_name: z.string(),
  reporter_id: z.string(),
  target_name: z.string(),
  target_id: z.string(),
  reason: z.enum(["harassment", "spam", "fake_profile", "inappropriate_content", "underage", "scam", "other"]),
  description: z.string(),
  status: z.enum(["open", "investigating", "resolved", "dismissed"]),
  created_at: z.string(),
  updated_at: z.string(),
  resolved_by: z.string().nullable(),
});

export const rawPaginatedReportsSchema = z.object({
  items: z.array(rawReportSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export type RawReport = z.infer<typeof rawReportSchema>;
export type RawPaginatedReports = z.infer<typeof rawPaginatedReportsSchema>;
