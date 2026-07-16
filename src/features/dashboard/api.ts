import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawDashboardOverviewSchema, rawRecentActivitySchema } from "./schemas";
import { dashboardOverviewFromRaw, recentActivityFromRaw } from "./adaptors";
import type { DashboardOverview, RecentActivity } from "./types";

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const { data } = await httpClient.get("/dashboard/overview");
  return validateAndAdapt(data, rawDashboardOverviewSchema, dashboardOverviewFromRaw);
}

export async function getRecentActivity(): Promise<RecentActivity> {
  const { data } = await httpClient.get("/dashboard/activity");
  return validateAndAdapt(data, rawRecentActivitySchema, recentActivityFromRaw);
}
