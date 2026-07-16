import type { TenantSettings } from "./types";
import type { RawTenantSettings } from "./schemas";

export function settingsFromRaw(raw: RawTenantSettings): TenantSettings {
  return {
    general: {
      name: raw.general.name,
      slug: raw.general.slug,
      contactEmail: raw.general.contact_email,
      timezone: raw.general.timezone,
    },
    moderation: {
      autoFlagThreshold: raw.moderation.auto_flag_threshold,
      requirePhotoVerification: raw.moderation.require_photo_verification,
      allowAnonymousReports: raw.moderation.allow_anonymous_reports,
    },
    notifications: {
      emailOnNewReport: raw.notifications.email_on_new_report,
      emailOnEscalation: raw.notifications.email_on_escalation,
      weeklyDigest: raw.notifications.weekly_digest,
    },
    featureFlags: raw.feature_flags.map((f) => ({
      key: f.key,
      label: f.label,
      enabled: f.enabled,
      description: f.description,
    })),
  };
}
