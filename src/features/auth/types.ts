import type { TenantMembership } from "@/features/tenants/types";

export type { TenantMembership };

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isSuperAdmin: boolean;
};

export type MeResponse = {
  user: AuthUser;
  memberships: TenantMembership[];
};

export type PasswordCredentials = {
  email: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  memberships: TenantMembership[];
};
