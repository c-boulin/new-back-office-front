import { z } from "zod";

export const tenantSettingsSchema = z.object({
  tenant_name: z.string(),
  support_email: z.string().email(),
  timezone: z.string(),
  locale: z.string(),
  feature_flags: z.record(z.string(), z.boolean()),
  brand_primary: z.string(),
  brand_accent: z.string(),
});

export type RawTenantSettings = z.infer<typeof tenantSettingsSchema>;
