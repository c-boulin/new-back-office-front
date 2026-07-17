import type { MatchesOverview } from "./types";
import type { RawMatchesOverview } from "./schemas";

export function matchesOverviewFromRaw(raw: RawMatchesOverview): MatchesOverview {
  return {
    totalMatches: raw.total_matches,
    matchRatePct: raw.match_rate_pct,
    averageQuality: raw.average_quality,
    medianMessagesPerMatch: raw.median_messages_per_match,
    matchesByDay: raw.matches_by_day,
    qualityDistribution: raw.quality_distribution,
    geoDistribution: raw.geo_distribution,
  };
}
