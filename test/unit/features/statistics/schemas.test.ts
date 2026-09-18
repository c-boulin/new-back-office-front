import { describe, it, expect } from "vitest";
import {
  usersStatsSchema,
  engagementStatsSchema,
  moderationStatsSchema,
  retentionStatsSchema,
} from "@/features/statistics/schemas";

const dailySeries = [{ date: "2026-09-01", count: 42 }];

describe("usersStatsSchema", () => {
  const valid = {
    compare: "previous_period" as const,
    signups: dailySeries,
    activeUsers: dailySeries,
    gender: { male: 100, female: 90, unknown: 10 },
    age: [{ bucket: "25-34", count: 50 }],
    countries: [{ name: "FR", count: 200 }],
    cities: [{ name: "Paris", count: 150 }],
    status: [{ status: "validated", count: 80 }],
    profilesWithoutPhoto: 12,
    completeProfileRate: 0.78,
    lastConnection: { last1Day: 500, last7Days: 2000, last30Days: 5000 },
    becameActiveAfterSignup: 0.65,
  };

  it("parses valid payload", () => {
    expect(() => usersStatsSchema.parse(valid)).not.toThrow();
  });

  it("rejects invalid compare value", () => {
    expect(() => usersStatsSchema.parse({ ...valid, compare: "invalid" })).toThrow();
  });
});

describe("engagementStatsSchema", () => {
  const valid = {
    compare: "none" as const,
    likes: dailySeries,
    matches: dailySeries,
    conversations: dailySeries,
    messages: dailySeries,
    stories: dailySeries,
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

  it("parses valid payload", () => {
    expect(() => engagementStatsSchema.parse(valid)).not.toThrow();
  });

  it("rejects missing funnel", () => {
    const noFunnel = { ...valid, funnel: undefined };
    expect(() => engagementStatsSchema.parse(noFunnel)).toThrow();
  });
});

describe("moderationStatsSchema", () => {
  const valid = {
    compare: "same_weekday" as const,
    reportsReceived: 50,
    reportsPending: 10,
    reportsAccepted: 30,
    reportsRefused: 10,
    reportsByReason: [],
    volumeByType: [{ type: "photo", count: 20 }],
    photosPending: 5,
    storiesPending: 3,
    blockedUsers: 2,
    deletedUsers: 1,
    usersWithMultipleReports: 4,
    confirmationRate: 0.9,
    revertRate: 0.05,
    averageDurationSeconds: 120,
  };

  it("parses valid payload", () => {
    expect(() => moderationStatsSchema.parse(valid)).not.toThrow();
  });

  it("rejects non-integer reportsPending", () => {
    expect(() => moderationStatsSchema.parse({ ...valid, reportsPending: 1.5 })).toThrow();
  });

  it("parses without compare field", () => {
    const noCompare = { ...valid };
    delete (noCompare as Record<string, unknown>).compare;
    expect(() => moderationStatsSchema.parse(noCompare)).not.toThrow();
  });
});

describe("retentionStatsSchema", () => {
  const valid = { day1: 0.72, day7: 0.45, day30: 0.2, churn: 0.08 };

  it("parses valid payload", () => {
    expect(() => retentionStatsSchema.parse(valid)).not.toThrow();
  });

  it("rejects missing churn", () => {
    const noChurn = { ...valid, churn: undefined };
    expect(() => retentionStatsSchema.parse(noChurn)).toThrow();
  });
});
