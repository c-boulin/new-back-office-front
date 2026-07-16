import type { TenantTheme } from "@/features/tenants/types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
};

export type TenantMembership = {
  tenantId: string;
  tenantSlug: string;
  tenantName: string;
  role: "owner" | "admin" | "moderator" | "viewer";
  permissions: string[];
  theme: TenantTheme | null;
  lastAccessedAt: string | null;
};

export type MeResponse = {
  user: AuthUser;
  memberships: TenantMembership[];
};
