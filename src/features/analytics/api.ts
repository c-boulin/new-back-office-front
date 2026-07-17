import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { analyticsOverviewSchema } from "./schemas";
import { analyticsFromRaw } from "./adaptors";
import type { AnalyticsOverview } from "./types";

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const { data } = await httpClient.get("/analytics/overview");
  return validateAndAdapt(data, analyticsOverviewSchema, analyticsFromRaw);
}
