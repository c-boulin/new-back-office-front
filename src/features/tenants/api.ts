import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { tenantSchema } from "./schemas";
import { tenantFromRaw } from "./adaptors";
import type { Tenant } from "./types";
import { z } from "zod";

const tenantListSchema = z.object({
  items: z.array(tenantSchema),
  total: z.number(),
});

export async function listTenants(): Promise<Tenant[]> {
  const { data } = await httpClient.get("/admin/tenants");
  return validateAndAdapt(data, tenantListSchema, (raw) => raw.items.map(tenantFromRaw));
}

export async function getTenant(id: string): Promise<Tenant> {
  const { data } = await httpClient.get(`/admin/tenants/${id}`);
  return validateAndAdapt(data, tenantSchema, tenantFromRaw);
}
