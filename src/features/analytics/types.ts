export type AnalyticsOverview = {
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  stickinessRatio: number;
  retention: { day: number; percentage: number }[];
  funnel: { step: string; count: number; conversion: number }[];
  activityByHour: { hour: number; value: number }[];
};
