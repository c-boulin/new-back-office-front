import { describe, it, expect } from "vitest";
import {
  usersStatsFromRaw,
  engagementStatsFromRaw,
  moderationStatsFromRaw,
  retentionStatsFromRaw,
} from "@/features/statistics/adaptors";

describe("usersStatsFromRaw", () => {
  it("passes fields through unchanged", () => {
    const raw = {
      compare: "previous_period" as const,
      signups: [{ date: "2026-09-01", count: 10 }],
      activeUsers: [{ date: "2026-09-01", count: 50 }],
      gender: { male: 10, female: 20, unknown: 5 },
      age: [{ bucket: "18-24", count: 15 }],
      countries: [{ name: "FR", count: 30 }],
      cities: [{ name: "Paris", count: 20 }],
      status: [{ status: "validated", count: 25 }],
      profilesWithoutPhoto: 3,
      completeProfileRate: 0.8,
      lastConnection: { last1Day: 100, last7Days: 500, last30Days: 1200 },
      becameActiveAfterSignup: 0.6,
    };
    const result = usersStatsFromRaw(raw);
    expect(result.signups).toEqual(raw.signups);
    expect(result.gender).toEqual(raw.gender);
    expect(result.completeProfileRate).toBe(0.8);
  });
});

describe("engagementStatsFromRaw", () => {
  it("preserves funnel structure", () => {
    const raw = {
      compare: "none" as const,
      likes: [],
      matches: [],
      conversations: [],
      messages: [],
      stories: [],
      matchRate: 0.25,
      conversationRate: 0.4,
      responseRate: 0.55,
      funnel: {
        activeUsers: 1000,
        usersWhoLiked: 800,
        usersWhoMatched: 400,
        usersWhoStartedConversation: 200,
        usersWhoGotReply: 100,
        activeToLiked: 0.8,
        likedToMatched: 0.5,
        matchedToConversation: 0.5,
        conversationToReply: 0.5,
      },
    };
    const result = engagementStatsFromRaw(raw);
    expect(result.funnel.activeUsers).toBe(1000);
    expect(result.matchRate).toBe(0.25);
  });
});

describe("moderationStatsFromRaw", () => {
  it("maps all fields", () => {
    const raw = {
      compare: "previous_period" as const,
      reportsReceived: 50,
      reportsPending: 10,
      reportsAccepted: 30,
      reportsRefused: 10,
      reportsByReason: [],
      volumeByType: [],
      photosPending: 5,
      storiesPending: 3,
      blockedUsers: 2,
      deletedUsers: 1,
      usersWithMultipleReports: 4,
      confirmationRate: 0.9,
      revertRate: 0.05,
      averageDurationSeconds: 120,
    };
    const result = moderationStatsFromRaw(raw);
    expect(result.reportsPending).toBe(10);
    expect(result.confirmationRate).toBe(0.9);
  });
});

describe("retentionStatsFromRaw", () => {
  it("returns retention values", () => {
    const raw = { day1: 0.72, day7: 0.45, day30: 0.2, churn: 0.08 };
    const result = retentionStatsFromRaw(raw);
    expect(result.day1).toBe(0.72);
    expect(result.churn).toBe(0.08);
  });
});
