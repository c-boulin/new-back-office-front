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
    card: raw.card,
    cardForeground: raw.card_foreground,
    popover: raw.popover,
    popoverForeground: raw.popover_foreground,
    secondary: raw.secondary,
    secondaryForeground: raw.secondary_foreground,
    muted: raw.muted,
    mutedForeground: raw.muted_foreground,
    border: raw.border,
    input: raw.input,
    ring: raw.ring,
    primaryForeground: raw.primary_foreground,
    accentForeground: raw.accent_foreground,
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
