import { z } from "zod";

export const rawFeatureFlagSchema = z.object({
  key: z.string(),
  label: z.string(),
  enabled: z.boolean(),
  description: z.string(),
});

export const rawTenantSettingsSchema = z.object({
  general: z.object({
    name: z.string(),
    slug: z.string(),
    contact_email: z.string(),
    timezone: z.string(),
  }),
  moderation: z.object({
    auto_flag_threshold: z.number().int(),
    require_photo_verification: z.boolean(),
    allow_anonymous_reports: z.boolean(),
  }),
  notifications: z.object({
    email_on_new_report: z.boolean(),
    email_on_escalation: z.boolean(),
    weekly_digest: z.boolean(),
  }),
  feature_flags: z.array(rawFeatureFlagSchema),
});

export type RawTenantSettings = z.infer<typeof rawTenantSettingsSchema>;
