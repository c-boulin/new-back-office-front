export const dashboardPayload = {
  compare: "previous_period",
  products: ["luna"],
  kpis: {
    activeUsers: {
      value: 1280,
      variation: -0.041,
      series: [
        { date: "2026-09-29", count: 180 },
        { date: "2026-09-30", count: 210 },
        { date: "2026-10-01", count: 195 },
      ],
    },
    matches: { value: 342, variation: 0.053, series: [] },
    reportsPending: { value: 7, variation: 0, series: [] },
    sessions: {
      value: 5400,
      variation: 0.12,
      series: [{ date: "2026-10-01", count: 900 }],
    },
    signups: { value: 64, variation: 0.2, series: [] },
  },
  urgentActions: [{ type: "reports", count: 7 }],
  recentActivity: [
    {
      id: "match-1",
      type: "match",
      occurredAt: "2026-10-07T11:55:00Z",
      actor: { id: 1, name: "Alice Martin", initials: "AM" },
      target: { id: 2, name: "Bruno Petit", initials: "BP" },
    },
    {
      id: "signup-3",
      type: "signup",
      occurredAt: "2026-10-07T10:00:00+00:00",
      actor: { id: 3, name: "Chloe Durand", initials: "CD" },
      target: null,
    },
  ],
};
