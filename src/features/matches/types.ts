export type MatchesOverview = {
  totalMatches: number;
  matchRatePct: number;
  averageQuality: number;
  medianMessagesPerMatch: number;
  matchesByDay: { date: string; value: number }[];
  qualityDistribution: { bucket: string; count: number }[];
  geoDistribution: { country: string; count: number }[];
};
