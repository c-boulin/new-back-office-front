import { describe, it, expect } from "vitest";
import { tenantFromRaw, themeFromRaw } from "@/features/tenants/adaptors";
import type { RawTenant, RawTenantTheme } from "@/features/tenants/schemas";

const rawTheme: RawTenantTheme = {
  primary: "1 2% 3%",
  accent: "4 5% 6%",
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  radius: "0.5rem",
  font_sans: "Inter",
};

const rawTenant: RawTenant = {
  id: "t1",
  slug: "luna",
  name: "  Luna  ",
  logo_url: null,
  status: "active",
  theme: rawTheme,
  feature_flags: { premium: true },
  created_at: "2024-01-01",
  users_count: 42,
};

describe("themeFromRaw", () => {
  it("renames font_sans to fontSans", () => {
    expect(themeFromRaw(rawTheme).fontSans).toBe("Inter");
  });

  it("maps every snake_case field to its camelCase counterpart when present", () => {
    const fullRaw: RawTenantTheme = {
      ...rawTheme,
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
    const domain = themeFromRaw(fullRaw);
    expect(domain.cardForeground).toBe("222 47% 11%");
    expect(domain.popoverForeground).toBe("222 47% 11%");
    expect(domain.secondaryForeground).toBe("222 47% 11%");
    expect(domain.mutedForeground).toBe("215 16% 47%");
    expect(domain.primaryForeground).toBe("210 40% 98%");
    expect(domain.accentForeground).toBe("210 40% 98%");
    expect(domain.ring).toBe("199 89% 48%");
    expect(domain.input).toBe("214 32% 91%");
    expect(domain.border).toBe("214 32% 91%");
  });

  it("leaves optional fields undefined (not empty strings) when the raw payload omits them", () => {
    const domain = themeFromRaw(rawTheme) as Record<string, unknown>;
    for (const key of [
      "card",
      "cardForeground",
      "popover",
      "popoverForeground",
      "secondary",
      "secondaryForeground",
      "muted",
      "mutedForeground",
      "border",
      "input",
      "ring",
      "primaryForeground",
      "accentForeground",
    ]) {
      expect(domain[key], `${key} should be undefined, not ""`).toBeUndefined();
    }
  });
});

describe("tenantFromRaw", () => {
  it("converts fields and sanitizes name", () => {
    const t = tenantFromRaw(rawTenant);
    expect(t.name).toBe("Luna");
    expect(t.logoUrl).toBeNull();
    expect(t.status).toBe("active");
    expect(t.usersCount).toBe(42);
    expect(t.theme.fontSans).toBe("Inter");
    expect(t.featureFlags).toEqual({ premium: true });
  });
});
