import type { AuthUser, TenantMembership } from "../types";

export type PasswordCredentials = {
  identifier: string;
  password: string;
};

export type PasswordSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
  memberships: TenantMembership[];
};
