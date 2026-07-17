import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";
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

  it("marks super-admin and allows any permission", () => {
    signInAs(superAdminFixture, []);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isSuperAdmin).toBe(true);
    expect(result.current.can(PERMISSIONS.SETTINGS_WRITE)).toBe(true);
    expect(result.current.can([PERMISSIONS.USERS_MODERATE, PERMISSIONS.ANALYTICS_READ])).toBe(true);
  });

  it("returns scoped permissions of the active tenant membership", () => {
    const membership = membershipFixture({
      tenantId: "t_luna",
      permissions: [PERMISSIONS.USERS_READ],
    });
    signInAs(operatorFixture, [membership]);
    activateTenant("t_luna", "luna");
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.can(PERMISSIONS.USERS_READ)).toBe(true);
    expect(result.current.can(PERMISSIONS.USERS_MODERATE)).toBe(false);
    expect(result.current.role).toBe("admin");
  });

  it("returns no permissions when the active tenant has no matching membership", () => {
    signInAs(operatorFixture, [membershipFixture({ tenantId: "t_other" })]);
    activateTenant("t_luna", "luna");
    const { result } = renderHook(() => usePermissions());
    expect(result.current.permissions).toEqual([]);
    expect(result.current.can(PERMISSIONS.USERS_READ)).toBe(false);
  });
});
