export type TimeSeriesPoint = {
  date: string;
  value: number;
};

export type CohortRow = {
  cohort: string;
  size: number;
  retentionByWeek: number[];
};

export type FunnelStep = {
  name: string;
  count: number;
  percentage: number;
};

export type GeoEntry = {
  country: string;
  countryCode: string;
  userCount: number;
  percentage: number;
};

export type AnalyticsData = {
  engagement: TimeSeriesPoint[];
  cohorts: CohortRow[];
  funnel: FunnelStep[];
  geo: GeoEntry[];
  summary: {
    totalUsers: number;
    dau: number;
    wau: number;
    mau: number;
    avgSessionMinutes: number;
  };
};

export type AnalyticsQuery = {
  range: "7d" | "30d" | "90d";
};
