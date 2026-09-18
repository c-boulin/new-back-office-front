import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { tenantDashboardSchema } from "./schemas";
import { dashboardFromRaw } from "./adaptors";
import type { TenantDashboard } from "./types";

function normalizeDashboard(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null) return raw;
  const obj = raw as Record<string, unknown>;
  if (!("urgent_actions" in obj)) {
    return { ...obj, urgent_actions: [] };
  }
  return raw;
}

export async function getTenantDashboard(): Promise<TenantDashboard> {
  const { data } = await httpClient.get("/v1/stats/dashboard");
  return validateAndAdapt(normalizeDashboard(data.data), tenantDashboardSchema, dashboardFromRaw);
}
