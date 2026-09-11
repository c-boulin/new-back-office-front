import type { RawApiUser } from "@/features/tenants/schemas";

export type MockAccount = {
  email: string;
  password: string;
  user: RawApiUser;
};

const ALL_PRODUCTS = [
  { id: 101, name: "Woozgo", slug: "woozgo" },
  { id: 102, name: "Weezchat FR", slug: "weezchat-fr" },
  { id: 103, name: "Weezchat CI", slug: "weezchat-ci" },
  { id: 104, name: "Toolov SK", slug: "toolov-sk" },
  { id: 105, name: "Weezchat TG", slug: "weezchat-tg" },
  { id: 106, name: "Swipi", slug: "swipi" },
] as const;

const FULL_PERMISSIONS = [
  "dashboard.read",
  "users.read",
  "users.write",
  "users.moderate",
  "moderation.read",
  "moderation.act",
  "analytics.read",
  "subscriptions.read",
  "subscriptions.write",
  "settings.write",
  "tenant.admin",
];

const MODERATOR_PERMISSIONS = [
  "dashboard.read",
  "users.read",
  "users.moderate",
  "moderation.read",
  "moderation.act",
];

function superAdmin(email: string, name: string): RawApiUser {
  return {
    name,
    email,
    isSuperAdmin: true,
    role: null,
    products: ALL_PRODUCTS.map((p) => ({
      ...p,
      role: { id: "admin", name: "admin" },
      permissions: FULL_PERMISSIONS,
    })),
  };
}

export const accountSeeds: MockAccount[] = [
  {
    email: "admin@weezchat.fr",
    password: "admin123",
    user: {
      name: "Admin Weezchat",
      email: "admin@weezchat.fr",
      isSuperAdmin: false,
      role: null,
      products: ALL_PRODUCTS.map((p) => ({
        ...p,
        role: { id: "admin", name: "admin" },
        permissions: FULL_PERMISSIONS,
      })),
    },
  },
  {
    email: "operator@watchtower.local",
    password: "operator",
    user: {
      name: "Jamie Rivera",
      email: "operator@watchtower.local",
      isSuperAdmin: false,
      role: null,
      products: ALL_PRODUCTS.slice(0, 2).map((p) => ({
        ...p,
        role: { id: "moderator", name: "moderator" },
        permissions: MODERATOR_PERMISSIONS,
      })),
    },
  },
  {
    email: "admin@watchtower.local",
    password: "admin",
    user: superAdmin("admin@watchtower.local", "Alex Morgan"),
  },
];
