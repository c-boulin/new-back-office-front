import { z } from "zod";

export const reportSchema = z.object({
  id: z.string(),
  reporter_name: z.string(),
  reporter_id: z.string(),
  subject_name: z.string(),
  subject_id: z.string(),
  category: z.enum([
    "harassment",
    "spam",
    "impersonation",
    "inappropriate_content",
    "underage",
    "other",
  ]),
  status: z.enum(["open", "in_review", "resolved", "dismissed"]),
  description: z.string(),
  created_at: z.string(),
  resolved_at: z.string().nullable(),
  resolver_name: z.string().nullable(),
});

export const paginatedReportsSchema = z.object({
  items: z.array(reportSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  page_size: z.number().int().positive(),
});

export type RawReport = z.infer<typeof reportSchema>;
export type RawPaginatedReports = z.infer<typeof paginatedReportsSchema>;
