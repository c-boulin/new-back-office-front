import { useAuthStore } from "@/stores/authStore";
import { useTenantStore } from "@/stores/tenantStore";
import { useUiStore } from "@/stores/uiStore";
import type { AuthUser, TenantMembership } from "@/features/auth/types";

export function resetStores() {
  useAuthStore.setState({
    status: "idle",
    method: null,
    user: null,
    accessToken: null,
    refreshToken: null,
    memberships: [],
  });
  useTenantStore.setState({
    activeTenantId: null,
    activeTenantSlug: null,
    activeTheme: null,
  });
  useUiStore.setState({ sidebarOpen: true, colorScheme: "system" });
}

export function signInAs(
  user: AuthUser,
  memberships: TenantMembership[] = [],
  token = "test-token",
) {
  useAuthStore.setState({
    status: "authenticated",
    method: "password",
    user,
    memberships,
    accessToken: token,
    refreshToken: "refresh-token",
  });
}

export function activateTenant(id: string, slug: string) {
  useTenantStore.setState({
    activeTenantId: id,
    activeTenantSlug: slug,
    activeTheme: null,
  });
}

export const superAdminFixture: AuthUser = {
  id: "admin@example.com",
  email: "admin@example.com",
  name: "Super Admin",
  isSuperAdmin: true,
  avatarUrl: null,
};

export const operatorFixture: AuthUser = {
  id: "operator@example.com",
  email: "operator@example.com",
  name: "Operator",
  isSuperAdmin: false,
  avatarUrl: null,
};

export const membershipFixture = (
  overrides: Partial<TenantMembership> = {},
): TenantMembership => ({
  tenantId: "t_luna",
  tenantSlug: "luna",
  tenantName: "Luna",
  role: "admin",
  permissions: [],
  theme: null,
  lastAccessedAt: null,
  ...overrides,
});
