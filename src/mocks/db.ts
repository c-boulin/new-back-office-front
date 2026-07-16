import type { RawTenant } from "@/features/tenants/schemas";
import type { RawUserRecord } from "@/features/users/schemas";
import { env } from "@/lib/env";
import { tenantSeeds } from "./seeds/tenants";
import { buildUserSeeds } from "./seeds/users";
import { accountSeeds, type MockAccount } from "./seeds/accounts";

type MockDatabase = {
  tenants: RawTenant[];
  usersByTenant: Record<string, RawUserRecord[]>;
  accounts: MockAccount[];
};

const STORAGE_KEY = "mock.db.v1";
const PER_TENANT_USERS = 120;

function seed(): MockDatabase {
  return {
    tenants: JSON.parse(JSON.stringify(tenantSeeds)) as RawTenant[],
    usersByTenant: Object.fromEntries(
      tenantSeeds.map((t, index) => [t.id, buildUserSeeds(t.id, 1_000 + index, PER_TENANT_USERS)]),
    ),
    accounts: JSON.parse(JSON.stringify(accountSeeds)) as MockAccount[],
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

export const db = {
  get tenants(): RawTenant[] {
    return dbRef.tenants;
  },
  usersFor(tenantId: string): RawUserRecord[] {
    if (!dbRef.usersByTenant[tenantId]) {
      dbRef.usersByTenant[tenantId] = buildUserSeeds(tenantId, tenantId.length + 1, PER_TENANT_USERS);
      persist();
    }
    return dbRef.usersByTenant[tenantId];
  },
  updateUser(tenantId: string, id: string, patch: Partial<RawUserRecord>): RawUserRecord | null {
    const list = this.usersFor(tenantId);
    const index = list.findIndex((u) => u.id === id);
    if (index < 0) return null;
    list[index] = { ...list[index], ...patch };
    persist();
    return list[index];
  },
  findAccount(identifier: string, password?: string): MockAccount | null {
    const normalized = identifier.trim().toLowerCase();
    return (
      dbRef.accounts.find(
        (a) =>
          a.identifier === normalized &&
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
