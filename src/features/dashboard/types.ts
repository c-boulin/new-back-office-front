export type DailyCount = {
  date: string;
  count: number;
};

export type Kpi = {
  value: number;
  variation: number;
  series: DailyCount[];
};

export type UrgentAction = {
  type: "reports" | "photos" | "stories";
  count: number;
};

export type ActivityType = "signup" | "match" | "message" | "verified" | "report";

export type ActivityActor = {
  id: number;
  name: string;
  initials: string;
};

export type RecentActivityItem = {
  id: string;
  type: ActivityType;
  occurredAt: string;
  actor: ActivityActor;
  target: ActivityActor | null;
};

export type CompareMode = "previous_period" | "same_weekday" | "none";

export type TenantDashboard = {
  compare: CompareMode;
  kpis: Record<string, Kpi>;
  urgentActions: UrgentAction[];
  recentActivity: RecentActivityItem[];
};
