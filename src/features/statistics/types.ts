export type DailyCount = {
  date: string;
  count: number;
};

export type StatsDateParams = {
  from?: string;
  to?: string;
  compare?: "previous_period" | "same_weekday" | "none";
};

// --- Users ---

export type AgeBucket = { bucket: string; count: number };
export type NameCount = { name: string; count: number };
export type StatusCount = { status: string; count: number };

export type UsersStats = {
  compare: string;
  signups: DailyCount[];
  activeUsers: DailyCount[];
  gender: { male: number; female: number; unknown: number };
  age: AgeBucket[];
  countries: NameCount[];
  cities: NameCount[];
  status: StatusCount[];
  profilesWithoutPhoto: number;
  completeProfileRate: number;
  lastConnection: { last1Day: number; last7Days: number; last30Days: number };
  becameActiveAfterSignup: number;
};

// --- Engagement ---

export type EngagementFunnel = {
  activeUsers: number;
  usersWhoLiked: number;
  usersWhoMatched: number;
  usersWhoStartedConversation: number;
  usersWhoGotReply: number;
  activeToLiked: number;
  likedToMatched: number;
  matchedToConversation: number;
  conversationToReply: number;
};

export type EngagementStats = {
  compare: string;
  likes: DailyCount[];
  matches: DailyCount[];
  conversations: DailyCount[];
  messages: DailyCount[];
  stories: DailyCount[];
  matchRate: number;
  conversationRate: number;
  responseRate: number;
  funnel: EngagementFunnel;
};

// --- Moderation ---

export type VolumeByType = { type: string; count: number };

export type ModerationStats = {
  reportsReceived: number;
  reportsPending: number;
  reportsAccepted: number;
  reportsRefused: number;
  reportsByReason: { reason: string; count: number }[];
  volumeByType: VolumeByType[];
  photosPending: number;
  storiesPending: number;
  blockedUsers: number;
  deletedUsers: number;
  usersWithMultipleReports: number;
  confirmationRate: number;
  revertRate: number;
  averageDurationSeconds: number;
};

// --- Retention ---

export type RetentionStats = {
  day1: number;
  day7: number;
  day30: number;
  churn: number;
};
