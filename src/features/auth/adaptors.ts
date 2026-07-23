import type { AuthUser, AuthSession, MeResponse, TenantMembership } from "./types";
import type {
  RawApiProduct,
  RawApiUser,
  RawLoginResponse,
  RawMeResponse,
} from "@/features/tenants/schemas";

type InternalRole = TenantMembership["role"];

const ROLE_MAP: Record<string, InternalRole> = {
  owner: "owner",
  admin: "admin",
  administrator: "admin",
  moderator: "moderator",
  viewer: "viewer",
  reader: "viewer",
};

export function mapApiRoleName(name: string): InternalRole {
  return ROLE_MAP[name.trim().toLowerCase()] ?? "admin";
}

export function productToMembership(product: RawApiProduct): TenantMembership {
  const idString = String(product.id);
  const slug = product.slug && product.slug.length > 0 ? product.slug : idString;
  return {
    tenantId: idString,
    tenantSlug: slug,
    tenantName: product.name,
    role: mapApiRoleName(product.role.name),
    permissions: product.permissions ?? [],
    theme: null,
    lastAccessedAt: null,
  };
}

export function apiUserToAuthUser(user: RawApiUser): AuthUser {
  const roleName = user.role?.name.trim() ?? null;
  return {
    id: user.email,
    name: user.name,
    email: user.email,
    avatarUrl: null,
    isSuperAdmin: roleName?.toLowerCase() === "super admin",
    roleName,
    permissions: user.permissions ?? [],
  };
}

export function loginResponseToSession(raw: RawLoginResponse): AuthSession {
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    user: apiUserToAuthUser(raw.user),
    memberships: raw.user.products.map(productToMembership),
  };
}

export function meResponseToMe(raw: RawMeResponse): MeResponse {
  return {
    user: apiUserToAuthUser(raw.user),
    memberships: raw.user.products.map(productToMembership),
  };
}
