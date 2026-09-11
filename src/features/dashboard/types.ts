export type StatTrend = { direction: "up" | "down" | "flat"; label: string };

export type DashboardStat = {
  id: string;
  label: string;
  value: number;
  formatted: string;
  hint: string;
  trend: StatTrend;
};

export type ActivityEvent = {
  id: string;
  actorName: string;
  action: "match" | "message" | "report" | "signup" | "verify" | "ban";
  target: string;
  createdAt: string;
};

export type TenantDashboard = {
  stats: DashboardStat[];
  engagement: { label: string; value: number }[];
  recentActivity: ActivityEvent[];
};
