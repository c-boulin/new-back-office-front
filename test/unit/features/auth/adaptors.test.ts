import { describe, it, expect } from "vitest";
import {
  apiUserToAuthUser,
  loginResponseToSession,
  mapApiRoleName,
  meResponseToMe,
  productToMembership,
} from "@/features/auth/adaptors";

describe("mapApiRoleName", () => {
  it.each([
    ["owner", "owner"],
    ["admin", "admin"],
    ["Administrator", "admin"],
    ["moderator", "moderator"],
    ["viewer", "viewer"],
    ["reader", "viewer"],
    ["totally-unknown-role", "admin"],
  ] as const)("maps %s -> %s", (input, expected) => {
    expect(mapApiRoleName(input)).toBe(expected);
  });
});

describe("productToMembership", () => {
  it("uses slug when present, falls back to id string otherwise", () => {
    expect(
      productToMembership({
        id: 69,
        name: "Luna",
        slug: "luna",
        role: { id: 1, name: "admin" },
      }).tenantSlug,
    ).toBe("luna");
    expect(
      productToMembership({
        id: 42,
        name: "Orbit",
        slug: null,
        role: { id: 2, name: "moderator" },
      }).tenantSlug,
    ).toBe("42");
  });

  it("projects role name through the mapping and picks up product permissions", () => {
    const m = productToMembership({
      id: 69,
      name: "Luna",
      slug: "luna",
      role: { id: 1, name: "administrator" },
      permissions: ["users.read"],
    });
    expect(m.role).toBe("admin");
    expect(m.permissions).toEqual(["users.read"]);
    expect(m.theme).toBeNull();
    expect(m.lastAccessedAt).toBeNull();
  });
});

describe("apiUserToAuthUser", () => {
  it("derives id from email and forces isSuperAdmin=false for non-super-admin roles", () => {
    const u = apiUserToAuthUser({
      name: "Alice",
      email: "alice@example.com",
      role: { id: 1, name: "admin" },
      products: [],
    });
    expect(u).toEqual({
      id: "alice@example.com",
      name: "Alice",
      email: "alice@example.com",
      avatarUrl: null,
      isSuperAdmin: false,
      roleName: "admin",
      permissions: [],
    });
  });

  it("marks isSuperAdmin=true when the role name is Super Admin", () => {
    const u = apiUserToAuthUser({
      name: "Root",
      email: "root@example.com",
      role: { id: 1, name: "Super Admin" },
      permissions: ["dashboard.read", "users.read"],
      products: [],
    });
    expect(u.isSuperAdmin).toBe(true);
    expect(u.roleName).toBe("Super Admin");
    expect(u.permissions).toEqual(["dashboard.read", "users.read"]);
  });
});

describe("loginResponseToSession", () => {
  it("maps tokens and memberships from products", () => {
    const session = loginResponseToSession({
      access_token: "at",
      refresh_token: "rt",
      user: {
        name: "Alice",
        email: "alice@example.com",
        role: { id: 1, name: "admin" },
        products: [
          { id: 69, name: "Luna", slug: "luna", role: { id: 1, name: "admin" } },
          { id: 42, name: "Orbit", slug: "orbit", role: { id: 2, name: "moderator" } },
        ],
      },
    });
    expect(session.accessToken).toBe("at");
    expect(session.refreshToken).toBe("rt");
    expect(session.memberships).toHaveLength(2);
    expect(session.memberships[0].tenantId).toBe("69");
    expect(session.memberships[1].role).toBe("moderator");
  });
});

describe("meResponseToMe", () => {
  it("maps user and derives memberships from products", () => {
    const me = meResponseToMe({
      user: {
        name: "Alice",
        email: "alice@example.com",
        role: null,
        products: [
          { id: 69, name: "Luna", slug: "luna", role: { id: 1, name: "admin" } },
        ],
      },
    });
    expect(me.user.email).toBe("alice@example.com");
    expect(me.memberships).toHaveLength(1);
    expect(me.memberships[0].tenantSlug).toBe("luna");
  });
});
