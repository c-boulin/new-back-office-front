import type { TenantSettings } from "./types";
import type { RawTenantSettings } from "./schemas";

export function settingsFromRaw(raw: RawTenantSettings): TenantSettings {
  return {
    tenantName: raw.tenant_name,
    supportEmail: raw.support_email,
    timezone: raw.timezone,
    locale: raw.locale,
    featureFlags: raw.feature_flags,
    brandPrimary: raw.brand_primary,
    brandAccent: raw.brand_accent,
  };
}

export function settingsToRaw(settings: Partial<TenantSettings>): Partial<RawTenantSettings> {
  const out: Partial<RawTenantSettings> = {};
  if (settings.tenantName !== undefined) out.tenant_name = settings.tenantName;
  if (settings.supportEmail !== undefined) out.support_email = settings.supportEmail;
  if (settings.timezone !== undefined) out.timezone = settings.timezone;
  if (settings.locale !== undefined) out.locale = settings.locale;
  if (settings.featureFlags !== undefined) out.feature_flags = settings.featureFlags;
  if (settings.brandPrimary !== undefined) out.brand_primary = settings.brandPrimary;
  if (settings.brandAccent !== undefined) out.brand_accent = settings.brandAccent;
  return out;
}
