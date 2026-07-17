import { sanitizeText } from "@/lib/sanitize";
import type { Tenant, TenantTheme } from "./types";
import type { RawTenant, RawTenantTheme } from "./schemas";

export function themeFromRaw(raw: RawTenantTheme): TenantTheme {
  return {
    primary: raw.primary,
    accent: raw.accent,
    background: raw.background,
    foreground: raw.foreground,
    radius: raw.radius,
    fontSans: raw.font_sans,
  };
}

export function tenantFromRaw(raw: RawTenant): Tenant {
  return {
    id: raw.id,
    slug: raw.slug,
    name: sanitizeText(raw.name),
    logoUrl: raw.logo_url,
    status: raw.status,
    theme: themeFromRaw(raw.theme),
    featureFlags: raw.feature_flags,
    createdAt: raw.created_at,
    usersCount: raw.users_count,
  };
}
