import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import { createRng } from "../rng";
import type { RawAnalyticsData } from "@/features/analytics/schemas";

type Params = Record<string, string | undefined>;

const COUNTRIES = [
  { country: "France", code: "FR" },
  { country: "Germany", code: "DE" },
  { country: "Netherlands", code: "NL" },
  { country: "Spain", code: "ES" },
  { country: "Italy", code: "IT" },
  { country: "Portugal", code: "PT" },
  { country: "Denmark", code: "DK" },
  { country: "Poland", code: "PL" },
  { country: "Ireland", code: "IE" },
  { country: "Greece", code: "GR" },
];

export function getData(tenantId: string | null, params: Params): RawAnalyticsData {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const users = db.usersFor(tenantId);
  const rng = createRng(tenantId.length * 67 + 11);
  const range = params.range ?? "30d";
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;

  const engagement = Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - i - 1) * 86_400_000);
    return {
      date: date.toISOString().split("T")[0],
      value: rng.int(Math.floor(users.length * 0.3), users.length),
    };
  });

  const cohorts = Array.from({ length: 6 }, (_, i) => {
    const weekStart = new Date(Date.now() - (i + 1) * 7 * 86_400_000);
    const size = rng.int(20, 80);
    return {
      cohort: `Week of ${weekStart.toISOString().split("T")[0]}`,
      size,
      retention_by_week: Array.from({ length: 6 - i }, (__, w) => {
        const base = 100 - w * rng.int(8, 18);
        return Math.max(0, base + rng.int(-5, 5));
      }),
    };
  });

  const funnelTotal = users.length;
  const funnel = [
    { name: "Profile Created", count: funnelTotal, percentage: 100 },
    { name: "Photo Uploaded", count: Math.floor(funnelTotal * 0.82), percentage: 82 },
    { name: "First Swipe", count: Math.floor(funnelTotal * 0.68), percentage: 68 },
    { name: "First Match", count: Math.floor(funnelTotal * 0.45), percentage: 45 },
    { name: "First Message", count: Math.floor(funnelTotal * 0.32), percentage: 32 },
    { name: "Active 7d", count: Math.floor(funnelTotal * 0.21), percentage: 21 },
  ];

  const totalGeoUsers = users.length;
  let remaining = totalGeoUsers;
  const geo = COUNTRIES.map((c, i) => {
    const isLast = i === COUNTRIES.length - 1;
    const count = isLast ? remaining : rng.int(Math.floor(remaining * 0.05), Math.floor(remaining * 0.3));
    remaining -= count;
    return {
      country: c.country,
      country_code: c.code,
      user_count: count,
      percentage: Math.round((count / totalGeoUsers) * 1000) / 10,
    };
  }).sort((a, b) => b.user_count - a.user_count);

  const dau = rng.int(Math.floor(users.length * 0.15), Math.floor(users.length * 0.35));
  const wau = rng.int(dau, Math.floor(users.length * 0.6));
  const mau = rng.int(wau, users.length);

  return {
    engagement,
    cohorts,
    funnel,
    geo,
    summary: {
      total_users: users.length,
      dau,
      wau,
      mau,
      avg_session_minutes: rng.int(4, 28) + rng.int(0, 9) / 10,
    },
  };
}
