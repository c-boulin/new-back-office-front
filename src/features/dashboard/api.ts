import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { tenantDashboardSchema } from "./schemas";
import { dashboardFromRaw } from "./adaptors";
import type { TenantDashboard } from "./types";

export async function getTenantDashboard(): Promise<TenantDashboard> {
  const { data } = await httpClient.get("/v1/stats/dashboard");
  return validateAndAdapt(data.data, tenantDashboardSchema, dashboardFromRaw);
}
