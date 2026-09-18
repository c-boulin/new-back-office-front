import type { RawUsersStats, RawEngagementStats, RawModerationStats, RawRetentionStats } from "./schemas";
import type { UsersStats, EngagementStats, ModerationStats, RetentionStats } from "./types";

export function usersStatsFromRaw(raw: RawUsersStats): UsersStats {
  return raw;
}

export function engagementStatsFromRaw(raw: RawEngagementStats): EngagementStats {
  return raw;
}

export function moderationStatsFromRaw(raw: RawModerationStats): ModerationStats {
  return {
    reportsReceived: raw.reportsReceived,
    reportsPending: raw.reportsPending,
    reportsAccepted: raw.reportsAccepted,
    reportsRefused: raw.reportsRefused,
    reportsByReason: raw.reportsByReason,
    volumeByType: raw.volumeByType,
    photosPending: raw.photosPending,
    storiesPending: raw.storiesPending,
    blockedUsers: raw.blockedUsers,
    deletedUsers: raw.deletedUsers,
    usersWithMultipleReports: raw.usersWithMultipleReports,
    confirmationRate: raw.confirmationRate,
    revertRate: raw.revertRate,
    averageDurationSeconds: raw.averageDurationSeconds,
  };
}

export function retentionStatsFromRaw(raw: RawRetentionStats): RetentionStats {
  return raw;
}
