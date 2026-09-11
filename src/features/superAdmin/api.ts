import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { platformAdminListSchema } from "./schemas";
import { platformAdminListFromRaw } from "./adaptors";
import type { PlatformAdmin } from "./types";

export async function listPlatformAdmins(): Promise<PlatformAdmin[]> {
  const { data } = await httpClient.get("/admin/admins");
  return validateAndAdapt(data, platformAdminListSchema, platformAdminListFromRaw);
}
