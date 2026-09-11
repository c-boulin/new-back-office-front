import { describe, it, expect } from "vitest";
import { matchesOverviewFromRaw } from "@/features/matches/adaptors";

describe("matchesOverviewFromRaw", () => {
  it("renames all snake_case fields", () => {
    const out = matchesOverviewFromRaw({
      total_matches: 10,
      match_rate_pct: 15.5,
      average_quality: 4.2,
      median_messages_per_match: 5,
      matches_by_day: [{ date: "2024-01-01", value: 1 }],
      quality_distribution: [{ bucket: "high", count: 3 }],
      geo_distribution: [{ country: "FR", count: 5 }],
    });
    expect(out.totalMatches).toBe(10);
    expect(out.matchRatePct).toBeCloseTo(15.5);
    expect(out.averageQuality).toBeCloseTo(4.2);
    expect(out.medianMessagesPerMatch).toBe(5);
    expect(out.matchesByDay).toHaveLength(1);
    expect(out.qualityDistribution[0].bucket).toBe("high");
    expect(out.geoDistribution[0].country).toBe("FR");
  });
});
