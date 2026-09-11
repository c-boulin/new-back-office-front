import { z } from "zod";

export const matchesOverviewSchema = z.object({
  total_matches: z.number().int().nonnegative(),
  match_rate_pct: z.number(),
  average_quality: z.number(),
  median_messages_per_match: z.number(),
  matches_by_day: z.array(z.object({ date: z.string(), value: z.number() })),
  quality_distribution: z.array(z.object({ bucket: z.string(), count: z.number() })),
  geo_distribution: z.array(z.object({ country: z.string(), count: z.number() })),
});

export type RawMatchesOverview = z.infer<typeof matchesOverviewSchema>;
