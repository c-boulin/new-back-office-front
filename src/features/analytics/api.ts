import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawAnalyticsDataSchema } from "./schemas";
import { analyticsDataFromRaw } from "./adaptors";
import type { AnalyticsData, AnalyticsQuery } from "./types";

export async function getAnalytics(query: AnalyticsQuery): Promise<AnalyticsData> {
  const { data } = await httpClient.get("/analytics", {
    params: { range: query.range },
  });
  return validateAndAdapt(data, rawAnalyticsDataSchema, analyticsDataFromRaw);
}
