import { describe, it, expect } from "vitest";
import {
  hasPermission,
  PERMISSIONS,
  PERMISSION_CATALOG,
  PERMISSION_TOTAL,
  slugsFromMatrix,
  countMatrixGrants,
} from "@/lib/permissions";

describe("hasPermission", () => {
  it("returns false when granted list is empty or undefined", () => {
    expect(hasPermission([], PERMISSIONS.USERS_READ)).toBe(false);
    expect(hasPermission(undefined, PERMISSIONS.USERS_READ)).toBe(false);
  });

  it("returns true when the required permission is granted", () => {
    expect(
      hasPermission([PERMISSIONS.USERS_READ], PERMISSIONS.USERS_READ),
    ).toBe(true);
  });

  it("returns false when a required permission is missing", () => {
    expect(
      hasPermission([PERMISSIONS.USERS_READ], PERMISSIONS.USERS_UPDATE),
    ).toBe(false);
  });

  it("requires every permission in an array", () => {
    expect(
      hasPermission(
        [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE],
        [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE],
      ),
    ).toBe(true);
    expect(
      hasPermission(
        [PERMISSIONS.USERS_READ],
        [PERMISSIONS.USERS_READ, PERMISSIONS.USERS_UPDATE],
      ),
    ).toBe(false);
  });
});

describe("permission catalog", () => {
  it("exposes exactly 27 slugs", () => {
    expect(PERMISSION_TOTAL).toBe(27);
    expect(PERMISSION_CATALOG).toHaveLength(27);
  });

  it("does not include invented slugs", () => {
    expect(PERMISSION_CATALOG).not.toContain("users.create");
    expect(PERMISSION_CATALOG).not.toContain("dashboard.update");
  });
});

describe("matrix helpers", () => {
  it("expands a matrix into the granted slug list", () => {
    const slugs = slugsFromMatrix({
      dashboard: { read: true },
      users: { read: true, update: false, delete: true },
    });
    expect(slugs).toEqual([
      PERMISSIONS.DASHBOARD_READ,
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_DELETE,
    ]);
  });

  it("counts grants from a matrix", () => {
    expect(
      countMatrixGrants({
        dashboard: { read: true },
        users: { read: true, update: true, delete: false },
      }),
    ).toBe(3);
  });
});
