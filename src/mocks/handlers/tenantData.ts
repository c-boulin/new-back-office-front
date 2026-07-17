import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawTenantDashboard } from "@/features/dashboard/schemas";
import type { RawMatchesOverview } from "@/features/matches/schemas";
import type { RawSubscriptionsOverview } from "@/features/subscriptions/schemas";
import type { RawAnalyticsOverview } from "@/features/analytics/schemas";
import type { RawTenantSettings } from "@/features/settings/schemas";
import type { RawPlatformAdminList } from "@/features/superAdmin/schemas";

function requireTenant(tenantId: string | null): string {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return tenantId;
}

export function dashboard(tenantId: string | null): RawTenantDashboard {
  return db.dashboardFor(requireTenant(tenantId));
}

export function matches(tenantId: string | null): RawMatchesOverview {
  return db.matchesFor(requireTenant(tenantId));
}

export function subscriptions(tenantId: string | null): RawSubscriptionsOverview {
  return db.subscriptionsFor(requireTenant(tenantId));
}

export function analytics(tenantId: string | null): RawAnalyticsOverview {
  return db.analyticsFor(requireTenant(tenantId));
}

export function settings(tenantId: string | null): RawTenantSettings {
  return db.settingsFor(requireTenant(tenantId));
}

export function updateSettings(
  tenantId: string | null,
  body: unknown,
): RawTenantSettings {
  const patch = (body ?? {}) as Partial<RawTenantSettings>;
  return db.updateSettings(requireTenant(tenantId), patch);
}

export function platformAdmins(): RawPlatformAdminList {
  return { items: db.platformAdmins, total: db.platformAdmins.length };
}
