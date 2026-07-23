import { describe, it, expect } from "vitest";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

describe("hasPermission", () => {
  it("returns false when granted list is empty or undefined", () => {
    expect(hasPermission([], PERMISSIONS.USERS_READ)).toBe(false);
    expect(hasPermission(undefined, PERMISSIONS.USERS_READ)).toBe(false);
  });

  it("returns true when super_admin regardless of required", () => {
    expect(hasPermission(["super_admin"], PERMISSIONS.USERS_MODERATE)).toBe(true);
    expect(
      hasPermission(["super_admin"], [
        PERMISSIONS.USERS_MODERATE,
        PERMISSIONS.SETTINGS_WRITE,
      ]),
    ).toBe(true);
  });

  it("returns true when the required permission is granted", () => {
    expect(
      hasPermission([PERMISSIONS.USERS_READ], PERMISSIONS.USERS_READ),
    ).toBe(true);
  });

  it("returns false when a required permission is missing", () => {
    expect(
      hasPermission([PERMISSIONS.USERS_READ], PERMISSIONS.USERS_MODERATE),
    ).toBe(false);
  });

  it("requires every permission in an array", () => {
    expect(
      hasPermission(
        [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE],
        [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE],
      ),
    ).toBe(true);
    expect(
      hasPermission(
        [PERMISSIONS.USERS_READ],
        [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_WRITE],
      ),
    ).toBe(false);
  });
});
