import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { tenantSettingsSchema } from "./schemas";
import { settingsFromRaw, settingsToRaw } from "./adaptors";
import type { TenantSettings, UpdateTenantSettings } from "./types";

export async function getTenantSettings(): Promise<TenantSettings> {
  const { data } = await httpClient.get("/settings");
  return validateAndAdapt(data, tenantSettingsSchema, settingsFromRaw);
}

export async function updateTenantSettings(
  patch: UpdateTenantSettings,
): Promise<TenantSettings> {
  const { data } = await httpClient.patch("/settings", settingsToRaw(patch));
  return validateAndAdapt(data, tenantSettingsSchema, settingsFromRaw);
}
