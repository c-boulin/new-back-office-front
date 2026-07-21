import type { RawApiUser } from "@/features/tenants/schemas";

export type MockAccount = {
  email: string;
  password: string;
  user: RawApiUser;
};

export const accountSeeds: MockAccount[] = [
  {
    email: "admin@watchtower.local",
    password: "admin",
    user: {
      name: "Alex Morgan",
      email: "admin@watchtower.local",
      role: { id: "administrator", name: "administrator" },
      products: [
        { id: 69, name: "Luna", slug: "luna", role: { id: "admin", name: "admin" } },
      ],
    },
  },
  {
    email: "operator@watchtower.local",
    password: "operator",
    user: {
      name: "Jamie Rivera",
      email: "operator@watchtower.local",
      role: { id: "moderator", name: "moderator" },
      products: [
        { id: 69, name: "Luna", slug: "luna", role: { id: "admin", name: "admin" } },
        { id: 42, name: "Orbit", slug: "orbit", role: { id: "moderator", name: "moderator" } },
      ],
    },
  },
];
