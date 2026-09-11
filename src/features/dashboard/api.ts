import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { tenantDashboardSchema } from "./schemas";
import { dashboardFromRaw } from "./adaptors";
import type { TenantDashboard } from "./types";

export async function getTenantDashboard(): Promise<TenantDashboard> {
  const { data } = await httpClient.get("/dashboard");
  return validateAndAdapt(data, tenantDashboardSchema, dashboardFromRaw);
}
