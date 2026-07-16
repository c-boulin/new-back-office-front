import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawTenantSettingsSchema } from "./schemas";
import { settingsFromRaw } from "./adaptors";
import type { TenantSettings, SettingsUpdatePayload } from "./types";

export async function getSettings(): Promise<TenantSettings> {
  const { data } = await httpClient.get("/settings");
  return validateAndAdapt(data, rawTenantSettingsSchema, settingsFromRaw);
}

export async function updateSettings(payload: SettingsUpdatePayload): Promise<TenantSettings> {
  const { data } = await httpClient.patch("/settings", payload);
  return validateAndAdapt(data, rawTenantSettingsSchema, settingsFromRaw);
}

export async function toggleFeatureFlag(key: string, enabled: boolean): Promise<void> {
  await httpClient.patch(`/settings/flags/${key}`, { enabled });
}
