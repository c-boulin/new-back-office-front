import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS, PERMISSION_TOTAL } from "@/lib/permissions";
import {
  resetStores,
  signInAs,
  activateTenant,
  membershipFixture,
  operatorFixture,
  superAdminFixture,
} from "@test/utils/fixtures";

describe("usePermissions", () => {
  beforeEach(() => {
    resetStores();
  });

  it("marks super admins and grants the full catalog", () => {
    signInAs(superAdminFixture, []);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isSuperAdmin).toBe(true);
    expect(result.current.permissions).toHaveLength(PERMISSION_TOTAL);
    expect(result.current.can(PERMISSIONS.SETTINGS_UPDATE)).toBe(true);
    expect(result.current.can([PERMISSIONS.USERS_DELETE, PERMISSIONS.MODERATION_UPDATE])).toBe(
      true,
    );
  });

  it("returns the scoped permissions of the active tenant membership", () => {
    const membership = membershipFixture({
      tenantId: "t_luna",
      permissions: [PERMISSIONS.USERS_READ],
    });
    signInAs(operatorFixture, [membership]);
    activateTenant("t_luna", "luna");
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.can(PERMISSIONS.USERS_READ)).toBe(true);
    expect(result.current.can(PERMISSIONS.USERS_UPDATE)).toBe(false);
    expect(result.current.role).toBe("admin");
  });

  it("falls back to the session-scoped permissions when no tenant is active", () => {
    signInAs(
      { ...operatorFixture, permissions: [PERMISSIONS.SETTINGS_READ] },
      [],
    );
    const { result } = renderHook(() => usePermissions());
    expect(result.current.permissions).toEqual([PERMISSIONS.SETTINGS_READ]);
    expect(result.current.can(PERMISSIONS.SETTINGS_READ)).toBe(true);
  });
});
