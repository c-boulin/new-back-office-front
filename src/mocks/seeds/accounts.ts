import type { RawAuthUser, RawMembership } from "@/features/tenants/schemas";
import { tenantSeeds } from "./tenants";

export type MockAccount = {
  identifier: string;
  password: string;
  user: RawAuthUser;
  memberships: RawMembership[];
};

export const accountSeeds: MockAccount[] = [
  {
    identifier: "admin",
    password: "admin",
    user: {
      id: "usr_super_admin",
      name: "Alex Morgan",
      email: "admin@watchtower.local",
      avatar_url: null,
      is_super_admin: true,
    },
    memberships: [],
  },
  {
    identifier: "operator",
    password: "operator",
    user: {
      id: "usr_operator",
      name: "Jamie Rivera",
      email: "jamie@watchtower.local",
      avatar_url: null,
      is_super_admin: false,
    },
    memberships: [
      {
        tenant_id: "tnt_luna",
        tenant_slug: "luna",
        tenant_name: "Luna",
        role: "admin",
        permissions: ["users.read", "users.write", "moderation.read", "reports.read"],
        theme: tenantSeeds[0].theme,
        last_accessed_at: null,
      },
      {
        tenant_id: "tnt_orbit",
        tenant_slug: "orbit",
        tenant_name: "Orbit",
        role: "moderator",
        permissions: ["users.read", "moderation.read"],
        theme: tenantSeeds[1].theme,
        last_accessed_at: null,
      },
    ],
  },
];
