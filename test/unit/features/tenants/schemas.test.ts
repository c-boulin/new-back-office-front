import { describe, it, expect } from "vitest";
import { tenantSchema, membershipSchema } from "@/features/tenants/schemas";

const validTheme = {
  primary: "1 2% 3%",
  accent: "4 5% 6%",
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  radius: "0.5rem",
  font_sans: "Inter",
};

describe("tenantSchema", () => {
  const valid = {
    id: "t1",
    slug: "luna",
    name: "Luna",
    logo_url: null,
    status: "active",
    theme: validTheme,
    feature_flags: { premium: true },
    created_at: "2024-01-01",
    users_count: 0,
  };

  it("parses valid tenant", () => {
    expect(() => tenantSchema.parse(valid)).not.toThrow();
  });

  it("rejects unknown status", () => {
    expect(() => tenantSchema.parse({ ...valid, status: "unknown" })).toThrow();
  });
});

describe("membershipSchema", () => {
  const valid = {
    tenant_id: "t1",
    tenant_slug: "luna",
    tenant_name: "Luna",
    role: "admin",
    permissions: ["users.read"],
    theme: null,
    last_accessed_at: null,
  };

  it("parses valid membership", () => {
    expect(() => membershipSchema.parse(valid)).not.toThrow();
  });

  it("rejects unknown role", () => {
    expect(() => membershipSchema.parse({ ...valid, role: "guest" })).toThrow();
  });
});
