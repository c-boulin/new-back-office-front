import { describe, it, expect } from "vitest";
import { authUserFromRaw, membershipFromRaw, meResponseFromRaw } from "@/features/auth/adaptors";

describe("authUserFromRaw", () => {
  it("converts snake_case fields", () => {
    const out = authUserFromRaw({
      id: "u1",
      name: "Alice",
      email: "alice@example.com",
      avatar_url: null,
      is_super_admin: true,
    });
    expect(out).toEqual({
      id: "u1",
      name: "Alice",
      email: "alice@example.com",
      avatarUrl: null,
      isSuperAdmin: true,
    });
  });
});

describe("membershipFromRaw", () => {
  it("converts membership fields and null theme", () => {
    const out = membershipFromRaw({
      tenant_id: "t1",
      tenant_slug: "luna",
      tenant_name: "Luna",
      role: "admin",
      permissions: ["users.read"],
      theme: null,
      last_accessed_at: null,
    });
    expect(out.tenantId).toBe("t1");
    expect(out.tenantSlug).toBe("luna");
    expect(out.tenantName).toBe("Luna");
    expect(out.theme).toBeNull();
    expect(out.lastAccessedAt).toBeNull();
  });

  it("converts theme when present", () => {
    const out = membershipFromRaw({
      tenant_id: "t1",
      tenant_slug: "luna",
      tenant_name: "Luna",
      role: "viewer",
      permissions: [],
      theme: {
        primary: "0 0% 0%",
        accent: "0 0% 100%",
        background: "0 0% 100%",
        foreground: "222 47% 11%",
        radius: "0.5rem",
        font_sans: "Inter",
      },
      last_accessed_at: "2024-06-01",
    });
    expect(out.theme?.fontSans).toBe("Inter");
    expect(out.lastAccessedAt).toBe("2024-06-01");
  });
});

describe("meResponseFromRaw", () => {
  it("maps user and every membership", () => {
    const out = meResponseFromRaw({
      user: {
        id: "u1",
        name: "Alice",
        email: "alice@example.com",
        avatar_url: null,
        is_super_admin: false,
      },
      memberships: [
        {
          tenant_id: "t1",
          tenant_slug: "luna",
          tenant_name: "Luna",
          role: "admin",
          permissions: [],
          theme: null,
          last_accessed_at: null,
        },
      ],
    });
    expect(out.user.name).toBe("Alice");
    expect(out.memberships).toHaveLength(1);
    expect(out.memberships[0].tenantId).toBe("t1");
  });
});
