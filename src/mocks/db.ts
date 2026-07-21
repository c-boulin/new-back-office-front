import type { RawTenant } from "@/features/tenants/schemas";
import type { RawUserRecord } from "@/features/users/schemas";
import type { RawModerationItem } from "@/features/moderation/schemas";
import type { RawReport } from "@/features/reports/schemas";
import type { RawMessageThread } from "@/features/messages/schemas";
import type { RawTenantDashboard } from "@/features/dashboard/schemas";
import type { RawMatchesOverview } from "@/features/matches/schemas";
import type { RawSubscriptionsOverview } from "@/features/subscriptions/schemas";
import type { RawAnalyticsOverview } from "@/features/analytics/schemas";
import type { RawTenantSettings } from "@/features/settings/schemas";
import type { RawPlatformAdmin } from "@/features/superAdmin/schemas";
import { env } from "@/lib/env";
import { tenantSeeds } from "./seeds/tenants";
import { buildUserSeeds } from "./seeds/users";
import { accountSeeds, type MockAccount } from "./seeds/accounts";
import {
  buildModerationSeeds,
  buildReportSeeds,
  buildMessageThreadSeeds,
  buildDashboard,
  buildMatches,
  buildSubscriptions,
  buildAnalytics,
  buildSettings,
  buildPlatformAdmins,
} from "./seeds/tenantData";

type MockDatabase = {
  tenants: RawTenant[];
  usersByTenant: Record<string, RawUserRecord[]>;
  moderationByTenant: Record<string, RawModerationItem[]>;
  reportsByTenant: Record<string, RawReport[]>;
  threadsByTenant: Record<string, RawMessageThread[]>;
  dashboardByTenant: Record<string, RawTenantDashboard>;
  matchesByTenant: Record<string, RawMatchesOverview>;
  subscriptionsByTenant: Record<string, RawSubscriptionsOverview>;
  analyticsByTenant: Record<string, RawAnalyticsOverview>;
  settingsByTenant: Record<string, RawTenantSettings>;
  accounts: MockAccount[];
  platformAdmins: RawPlatformAdmin[];
};

const STORAGE_KEY = "mock.db.v3";
const PER_TENANT_USERS = 120;

function seedTenantScoped<T>(
  tenants: RawTenant[],
  offset: number,
  build: (id: string, seed: number) => T,
): Record<string, T> {
  return Object.fromEntries(tenants.map((t, i) => [t.id, build(t.id, offset + i)]));
}

function seed(): MockDatabase {
  const tenants = JSON.parse(JSON.stringify(tenantSeeds)) as RawTenant[];
  return {
    tenants,
    usersByTenant: Object.fromEntries(
      tenants.map((t, i) => [t.id, buildUserSeeds(t.id, 1_000 + i, PER_TENANT_USERS)]),
    ),
    moderationByTenant: seedTenantScoped(tenants, 2_000, buildModerationSeeds),
    reportsByTenant: seedTenantScoped(tenants, 3_000, buildReportSeeds),
    threadsByTenant: seedTenantScoped(tenants, 4_000, buildMessageThreadSeeds),
    dashboardByTenant: seedTenantScoped(tenants, 5_000, buildDashboard),
    matchesByTenant: seedTenantScoped(tenants, 6_000, buildMatches),
    subscriptionsByTenant: seedTenantScoped(tenants, 7_000, buildSubscriptions),
    analyticsByTenant: seedTenantScoped(tenants, 8_000, buildAnalytics),
    settingsByTenant: Object.fromEntries(tenants.map((t) => [t.id, buildSettings(t.id)])),
    accounts: JSON.parse(JSON.stringify(accountSeeds)) as MockAccount[],
    platformAdmins: buildPlatformAdmins(),
  };
}

function load(): MockDatabase {
  if (!env.mock.persist) return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed();
    return JSON.parse(raw) as MockDatabase;
  } catch {
    return seed();
  }
}

let dbRef: MockDatabase = load();

function persist() {
  if (!env.mock.persist) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dbRef));
  } catch {
    /* quota — safe to ignore for mocks */
  }
}

function ensure<T>(record: Record<string, T>, tenantId: string, build: () => T): T {
  if (!record[tenantId]) {
    record[tenantId] = build();
    persist();
  }
  return record[tenantId];
}

export const db = {
  get tenants(): RawTenant[] {
    return dbRef.tenants;
  },
  get platformAdmins(): RawPlatformAdmin[] {
    return dbRef.platformAdmins;
  },
  usersFor(tenantId: string): RawUserRecord[] {
    return ensure(dbRef.usersByTenant, tenantId, () =>
      buildUserSeeds(tenantId, tenantId.length + 1, PER_TENANT_USERS),
    );
  },
  moderationFor(tenantId: string): RawModerationItem[] {
    return ensure(dbRef.moderationByTenant, tenantId, () =>
      buildModerationSeeds(tenantId, 2_000 + tenantId.length),
    );
  },
  reportsFor(tenantId: string): RawReport[] {
    return ensure(dbRef.reportsByTenant, tenantId, () =>
      buildReportSeeds(tenantId, 3_000 + tenantId.length),
    );
  },
  threadsFor(tenantId: string): RawMessageThread[] {
    return ensure(dbRef.threadsByTenant, tenantId, () =>
      buildMessageThreadSeeds(tenantId, 4_000 + tenantId.length),
    );
  },
  dashboardFor(tenantId: string): RawTenantDashboard {
    return ensure(dbRef.dashboardByTenant, tenantId, () =>
      buildDashboard(tenantId, 5_000 + tenantId.length),
    );
  },
  matchesFor(tenantId: string): RawMatchesOverview {
    return ensure(dbRef.matchesByTenant, tenantId, () =>
      buildMatches(tenantId, 6_000 + tenantId.length),
    );
  },
  subscriptionsFor(tenantId: string): RawSubscriptionsOverview {
    return ensure(dbRef.subscriptionsByTenant, tenantId, () =>
      buildSubscriptions(tenantId, 7_000 + tenantId.length),
    );
  },
  analyticsFor(tenantId: string): RawAnalyticsOverview {
    return ensure(dbRef.analyticsByTenant, tenantId, () =>
      buildAnalytics(tenantId, 8_000 + tenantId.length),
    );
  },
  settingsFor(tenantId: string): RawTenantSettings {
    return ensure(dbRef.settingsByTenant, tenantId, () => buildSettings(tenantId));
  },
  updateUser(tenantId: string, id: string, patch: Partial<RawUserRecord>): RawUserRecord | null {
    const list = this.usersFor(tenantId);
    const index = list.findIndex((u) => u.id === id);
    if (index < 0) return null;
    list[index] = { ...list[index], ...patch };
    persist();
    return list[index];
  },
  updateModeration(
    tenantId: string,
    id: string,
    patch: Partial<RawModerationItem>,
  ): RawModerationItem | null {
    const list = this.moderationFor(tenantId);
    const index = list.findIndex((m) => m.id === id);
    if (index < 0) return null;
    list[index] = { ...list[index], ...patch };
    persist();
    return list[index];
  },
  updateReport(tenantId: string, id: string, patch: Partial<RawReport>): RawReport | null {
    const list = this.reportsFor(tenantId);
    const index = list.findIndex((r) => r.id === id);
    if (index < 0) return null;
    list[index] = { ...list[index], ...patch };
    persist();
    return list[index];
  },
  updateSettings(tenantId: string, patch: Partial<RawTenantSettings>): RawTenantSettings {
    const current = this.settingsFor(tenantId);
    const next = { ...current, ...patch };
    dbRef.settingsByTenant[tenantId] = next;
    persist();
    return next;
  },
  findAccount(email: string, password?: string): MockAccount | null {
    const normalized = email.trim().toLowerCase();
    return (
      dbRef.accounts.find(
        (a) =>
          a.email.toLowerCase() === normalized &&
          (password === undefined || a.password === password),
      ) ?? null
    );
  },
  reset() {
    dbRef = seed();
    persist();
  },
};

if (typeof window !== "undefined" && env.mock.api) {
  (window as unknown as { __mockDb?: typeof db }).__mockDb = db;
}
