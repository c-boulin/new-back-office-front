import { describe, it, expect } from "vitest";
import { matchesOverviewSchema } from "@/features/matches/schemas";

describe("matchesOverviewSchema", () => {
  it("parses valid", () => {
    expect(() =>
      matchesOverviewSchema.parse({
        total_matches: 1,
        match_rate_pct: 0,
        average_quality: 0,
        median_messages_per_match: 0,
        matches_by_day: [],
        quality_distribution: [],
        geo_distribution: [],
      }),
    ).not.toThrow();
  });

  it("rejects negative total_matches", () => {
    expect(() =>
      matchesOverviewSchema.parse({
        total_matches: -1,
        match_rate_pct: 0,
        average_quality: 0,
        median_messages_per_match: 0,
        matches_by_day: [],
        quality_distribution: [],
        geo_distribution: [],
      }),
    ).toThrow();
  });
});
