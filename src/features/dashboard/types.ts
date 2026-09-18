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
  type: string;
  count: number;
};

export type TenantDashboard = {
  kpis: Record<string, Kpi>;
  urgentActions: UrgentAction[];
};
