import type { RawUsersStats, RawEngagementStats, RawModerationStats, RawRetentionStats } from "./schemas";
import type { UsersStats, EngagementStats, ModerationStats, RetentionStats } from "./types";

export function usersStatsFromRaw(raw: RawUsersStats): UsersStats {
  return raw;
}

export function engagementStatsFromRaw(raw: RawEngagementStats): EngagementStats {
  return raw;
}

export function moderationStatsFromRaw(raw: RawModerationStats): ModerationStats {
  return raw;
}

export function retentionStatsFromRaw(raw: RawRetentionStats): RetentionStats {
  return raw;
}
