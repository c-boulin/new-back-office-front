import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawTenantSettings } from "@/features/settings/schemas";

const settingsCache: Record<string, RawTenantSettings> = {};

function getDefault(tenantId: string): RawTenantSettings {
  const tenant = db.tenants.find((t) => t.id === tenantId);
  return {
    general: {
      name: tenant?.name ?? "Unknown",
      slug: tenant?.slug ?? "unknown",
      contact_email: `admin@${tenant?.slug ?? "unknown"}.app`,
      timezone: "Europe/Paris",
    },
    moderation: {
      auto_flag_threshold: 3,
      require_photo_verification: true,
      allow_anonymous_reports: true,
    },
    notifications: {
      email_on_new_report: true,
      email_on_escalation: true,
      weekly_digest: false,
    },
    feature_flags: [
      { key: "premium", label: "Premium subscriptions", enabled: tenant?.feature_flags?.premium ?? false, description: "Enable paid subscription tiers" },
      { key: "moderation", label: "Auto-moderation", enabled: tenant?.feature_flags?.moderation ?? true, description: "AI-assisted content moderation" },
      { key: "video", label: "Video calls", enabled: tenant?.feature_flags?.video ?? false, description: "In-app video calling between matches" },
      { key: "stories", label: "Stories", enabled: false, description: "24-hour ephemeral photo/video stories" },
      { key: "location", label: "Location sharing", enabled: true, description: "Real-time location sharing during dates" },
    ],
  };
}

function getSettings(tenantId: string): RawTenantSettings {
  if (!settingsCache[tenantId]) settingsCache[tenantId] = getDefault(tenantId);
  return settingsCache[tenantId];
}

export function get(tenantId: string | null): RawTenantSettings {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return getSettings(tenantId);
}

export function update(tenantId: string | null, body: unknown): RawTenantSettings {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const current = getSettings(tenantId);
  const patch = body as Record<string, unknown>;

  if (patch.general) {
    const g = patch.general as Record<string, string>;
    if (g.name) current.general.name = g.name;
    if (g.contact_email) current.general.contact_email = g.contact_email;
    if (g.timezone) current.general.timezone = g.timezone;
  }
  if (patch.moderation) {
    const m = patch.moderation as Record<string, unknown>;
    if (m.auto_flag_threshold !== undefined) current.moderation.auto_flag_threshold = m.auto_flag_threshold as number;
    if (m.require_photo_verification !== undefined) current.moderation.require_photo_verification = m.require_photo_verification as boolean;
    if (m.allow_anonymous_reports !== undefined) current.moderation.allow_anonymous_reports = m.allow_anonymous_reports as boolean;
  }
  if (patch.notifications) {
    const n = patch.notifications as Record<string, unknown>;
    if (n.email_on_new_report !== undefined) current.notifications.email_on_new_report = n.email_on_new_report as boolean;
    if (n.email_on_escalation !== undefined) current.notifications.email_on_escalation = n.email_on_escalation as boolean;
    if (n.weekly_digest !== undefined) current.notifications.weekly_digest = n.weekly_digest as boolean;
  }

  settingsCache[tenantId] = current;
  return current;
}

export function toggleFlag(tenantId: string | null, key: string, body: unknown): void {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const current = getSettings(tenantId);
  const flag = current.feature_flags.find((f) => f.key === key);
  if (!flag) throw new AppError("not_found", "Flag not found", 404);
  flag.enabled = (body as { enabled: boolean }).enabled;
  settingsCache[tenantId] = current;
}
