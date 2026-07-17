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
