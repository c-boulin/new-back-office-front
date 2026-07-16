import type { AuthUser, MeResponse, TenantMembership } from "./types";
import type { RawAuthUser, RawMembership, RawMeResponse } from "@/features/tenants/schemas";
import { themeFromRaw } from "@/features/tenants/adaptors";

export function authUserFromRaw(raw: RawAuthUser): AuthUser {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    avatarUrl: raw.avatar_url,
    isSuperAdmin: raw.is_super_admin,
  };
}

export function membershipFromRaw(raw: RawMembership): TenantMembership {
  return {
    tenantId: raw.tenant_id,
    tenantSlug: raw.tenant_slug,
    tenantName: raw.tenant_name,
    role: raw.role,
    permissions: raw.permissions,
    theme: raw.theme ? themeFromRaw(raw.theme) : null,
    lastAccessedAt: raw.last_accessed_at,
  };
}

export function meResponseFromRaw(raw: RawMeResponse): MeResponse {
  return {
    user: authUserFromRaw(raw.user),
    memberships: raw.memberships.map(membershipFromRaw),
  };
}
