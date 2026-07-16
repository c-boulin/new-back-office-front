export type StatItem = {
  label: string;
  value: number;
  previousValue: number;
  trendDirection: "up" | "down" | "flat";
  trendLabel: string;
};

export type ActivityItem = {
  id: string;
  actorName: string;
  actorAvatarUrl: string | null;
  action: string;
  targetName: string;
  occurredAt: string;
};

export type DashboardOverview = {
  activeUsers: StatItem;
  newMatches: StatItem;
  openReports: StatItem;
  sessions: StatItem;
};

export type RecentActivity = {
  items: ActivityItem[];
};
