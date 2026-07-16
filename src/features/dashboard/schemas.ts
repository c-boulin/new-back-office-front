import { z } from "zod";

export const rawStatItemSchema = z.object({
  label: z.string(),
  value: z.number(),
  previous_value: z.number(),
  trend_direction: z.enum(["up", "down", "flat"]),
  trend_label: z.string(),
});

export const rawDashboardOverviewSchema = z.object({
  active_users: rawStatItemSchema,
  new_matches: rawStatItemSchema,
  open_reports: rawStatItemSchema,
  sessions: rawStatItemSchema,
});

export const rawActivityItemSchema = z.object({
  id: z.string(),
  actor_name: z.string(),
  actor_avatar_url: z.string().nullable(),
  action: z.string(),
  target_name: z.string(),
  occurred_at: z.string(),
});

export const rawRecentActivitySchema = z.object({
  items: z.array(rawActivityItemSchema),
});

export type RawDashboardOverview = z.infer<typeof rawDashboardOverviewSchema>;
export type RawActivityItem = z.infer<typeof rawActivityItemSchema>;
export type RawRecentActivity = z.infer<typeof rawRecentActivitySchema>;
