import { describe, it, expect } from "vitest";
import { tenantSchema, membershipSchema, tenantThemeSchema } from "@/features/tenants/schemas";

const validTheme = {
  primary: "1 2% 3%",
  accent: "4 5% 6%",
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  radius: "0.5rem",
  font_sans: "Inter",
};

const fullTheme = {
  ...validTheme,
  card: "0 0% 100%",
  card_foreground: "222 47% 11%",
  popover: "0 0% 100%",
  popover_foreground: "222 47% 11%",
  secondary: "210 40% 96%",
  secondary_foreground: "222 47% 11%",
  muted: "210 40% 96%",
  muted_foreground: "215 16% 47%",
  border: "214 32% 91%",
  input: "214 32% 91%",
  ring: "199 89% 48%",
  primary_foreground: "210 40% 98%",
  accent_foreground: "210 40% 98%",
};

describe("tenantThemeSchema", () => {
  it("parses the full extended token surface", () => {
    const parsed = tenantThemeSchema.parse(fullTheme);
    expect(parsed.card_foreground).toBe("222 47% 11%");
    expect(parsed.primary_foreground).toBe("210 40% 98%");
    expect(parsed.accent_foreground).toBe("210 40% 98%");
    expect(parsed.ring).toBe("199 89% 48%");
  });

  it("parses a minimal theme with none of the extended fields", () => {
    const parsed = tenantThemeSchema.parse(validTheme);
    expect(parsed.card).toBeUndefined();
    expect(parsed.card_foreground).toBeUndefined();
    expect(parsed.primary_foreground).toBeUndefined();
  });

  it("does not insert phantom defaults for missing optional fields", () => {
    const parsed = tenantThemeSchema.parse(validTheme) as Record<string, unknown>;
    for (const key of [
      "card",
      "card_foreground",
      "popover",
      "popover_foreground",
      "secondary",
      "secondary_foreground",
      "muted",
      "muted_foreground",
      "border",
      "input",
      "ring",
      "primary_foreground",
      "accent_foreground",
    ]) {
      expect(parsed[key], `${key} should be absent, not empty`).toBeUndefined();
    }
  });
});

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
