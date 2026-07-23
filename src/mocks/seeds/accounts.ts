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

function fullAccess(email: string, name: string): RawApiUser {
  return {
    name,
    email,
    role: { id: "administrator", name: "administrator" },
    products: ALL_PRODUCTS.map((p) => ({
      ...p,
      role: { id: "admin", name: "admin" },
    })),
  };
}

export const accountSeeds: MockAccount[] = [
  {
    email: "admin@weezchat.fr",
    password: "admin123",
    user: fullAccess("admin@weezchat.fr", "Admin Weezchat"),
  },
  {
    email: "operator@watchtower.local",
    password: "operator",
    user: {
      name: "Jamie Rivera",
      email: "operator@watchtower.local",
      role: { id: "moderator", name: "moderator" },
      products: ALL_PRODUCTS.slice(0, 2).map((p) => ({
        ...p,
        role: { id: "moderator", name: "moderator" },
      })),
    },
  },
  {
    email: "admin@watchtower.local",
    password: "admin",
    user: fullAccess("admin@watchtower.local", "Alex Morgan"),
  },
];
