import { z } from "zod";

const dailyCountSchema = z.object({
  date: z.string(),
  count: z.number().int(),
});

const compareSchema = z.enum(["previous_period", "same_weekday", "none"]);

// --- Users ---

export const usersStatsSchema = z.object({
  compare: compareSchema,
  signups: z.array(dailyCountSchema),
  activeUsers: z.array(dailyCountSchema),
  gender: z.object({
    male: z.number().int(),
    female: z.number().int(),
    unknown: z.number().int(),
  }),
  age: z.array(z.object({ bucket: z.string(), count: z.number().int() })),
  countries: z.array(z.object({ name: z.string(), count: z.number().int() })),
  cities: z.array(z.object({ name: z.string(), count: z.number().int() })),
  status: z.array(z.object({ status: z.string(), count: z.number().int() })),
  profilesWithoutPhoto: z.number().int(),
  completeProfileRate: z.number(),
  lastConnection: z.object({
    last1Day: z.number().int(),
    last7Days: z.number().int(),
    last30Days: z.number().int(),
  }),
  becameActiveAfterSignup: z.number(),
});

export type RawUsersStats = z.infer<typeof usersStatsSchema>;

// --- Engagement ---

const funnelSchema = z.object({
  activeUsers: z.number().int(),
  usersWhoLiked: z.number().int(),
  usersWhoMatched: z.number().int(),
  usersWhoStartedConversation: z.number().int(),
  usersWhoGotReply: z.number().int(),
  activeToLiked: z.number(),
  likedToMatched: z.number(),
  matchedToConversation: z.number(),
  conversationToReply: z.number(),
});

export const engagementStatsSchema = z.object({
  compare: compareSchema,
  likes: z.array(dailyCountSchema),
  matches: z.array(dailyCountSchema),
  conversations: z.array(dailyCountSchema),
  messages: z.array(dailyCountSchema),
  stories: z.array(dailyCountSchema),
  matchRate: z.number(),
  conversationRate: z.number(),
  responseRate: z.number(),
  funnel: funnelSchema,
});

export type RawEngagementStats = z.infer<typeof engagementStatsSchema>;

// --- Moderation ---

export const moderationStatsSchema = z.object({
  compare: compareSchema,
  reportsReceived: z.number().int(),
  reportsPending: z.number().int(),
  reportsAccepted: z.number().int(),
  reportsRefused: z.number().int(),
  reportsByReason: z.array(z.object({ reason: z.string(), count: z.number().int() })),
  volumeByType: z.array(z.object({ type: z.string(), count: z.number().int() })),
  photosPending: z.number().int(),
  storiesPending: z.number().int(),
  blockedUsers: z.number().int(),
  deletedUsers: z.number().int(),
  usersWithMultipleReports: z.number().int(),
  confirmationRate: z.number(),
  revertRate: z.number(),
  averageDurationSeconds: z.number(),
});

export type RawModerationStats = z.infer<typeof moderationStatsSchema>;

// --- Retention ---

export const retentionStatsSchema = z.object({
  day1: z.number(),
  day7: z.number(),
  day30: z.number(),
  churn: z.number(),
});

export type RawRetentionStats = z.infer<typeof retentionStatsSchema>;
