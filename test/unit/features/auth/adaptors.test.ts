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
        permissions: [],
      }).tenantSlug,
    ).toBe("luna");
    expect(
      productToMembership({
        id: 42,
        name: "Orbit",
        slug: null,
        role: { id: 2, name: "moderator" },
        permissions: [],
      }).tenantSlug,
    ).toBe("42");
  });

  it("projects role name and copies permissions from the API payload", () => {
    const m = productToMembership({
      id: 69,
      name: "Luna",
      slug: "luna",
      role: { id: 1, name: "administrator" },
      permissions: ["users.read", "moderation.read"],
    });
    expect(m.role).toBe("admin");
    expect(m.permissions).toEqual(["users.read", "moderation.read"]);
    expect(m.theme).toBeNull();
    expect(m.lastAccessedAt).toBeNull();
  });
});

describe("apiUserToAuthUser", () => {
  it("carries isSuperAdmin from the API payload", () => {
    expect(
      apiUserToAuthUser({
        name: "Alice",
        email: "alice@example.com",
        isSuperAdmin: true,
        role: null,
        products: [],
      }).isSuperAdmin,
    ).toBe(true);

    expect(
      apiUserToAuthUser({
        name: "Bob",
        email: "bob@example.com",
        isSuperAdmin: false,
        role: null,
        products: [],
      }),
    ).toEqual({
      id: "bob@example.com",
      name: "Bob",
      email: "bob@example.com",
      avatarUrl: null,
      isSuperAdmin: false,
    });
  });

  it("defaults isSuperAdmin to false when the field is missing", () => {
    expect(
      apiUserToAuthUser({
        name: "Alice",
        email: "alice@example.com",
        role: null,
        products: [],
      } as never).isSuperAdmin,
    ).toBe(false);
  });
});

describe("loginResponseToSession", () => {
  it("maps tokens and memberships (with permissions) from products", () => {
    const session = loginResponseToSession({
      access_token: "at",
      refresh_token: "rt",
      user: {
        name: "Alice",
        email: "alice@example.com",
        isSuperAdmin: false,
        role: null,
        products: [
          {
            id: 69,
            name: "Luna",
            slug: "luna",
            role: { id: 1, name: "admin" },
            permissions: ["users.read"],
          },
          {
            id: 42,
            name: "Orbit",
            slug: "orbit",
            role: { id: 2, name: "moderator" },
            permissions: ["moderation.read"],
          },
        ],
      },
    });
    expect(session.accessToken).toBe("at");
    expect(session.refreshToken).toBe("rt");
    expect(session.memberships).toHaveLength(2);
    expect(session.memberships[0].tenantId).toBe("69");
    expect(session.memberships[0].permissions).toEqual(["users.read"]);
    expect(session.memberships[1].role).toBe("moderator");
    expect(session.memberships[1].permissions).toEqual(["moderation.read"]);
  });
});

describe("meResponseToMe", () => {
  it("maps user (with isSuperAdmin) and derives memberships from products", () => {
    const me = meResponseToMe({
      user: {
        name: "Alice",
        email: "alice@example.com",
        isSuperAdmin: true,
        role: null,
        products: [
          {
            id: 69,
            name: "Luna",
            slug: "luna",
            role: { id: 1, name: "admin" },
            permissions: ["dashboard.read"],
          },
        ],
      },
    });
    expect(me.user.isSuperAdmin).toBe(true);
    expect(me.memberships).toHaveLength(1);
    expect(me.memberships[0].tenantSlug).toBe("luna");
    expect(me.memberships[0].permissions).toEqual(["dashboard.read"]);
  });
});
