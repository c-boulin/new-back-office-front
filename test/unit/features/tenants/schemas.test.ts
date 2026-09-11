import { describe, it, expect } from "vitest";
import {
  apiProductSchema,
  apiUserSchema,
  loginResponseSchema,
  meResponseSchema,
  ssoInitResponseSchema,
  tenantSchema,
  tenantThemeSchema,
} from "@/features/tenants/schemas";

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
  });
});

describe("tenantSchema", () => {
  const valid = {
    id: "t1",
    slug: "luna",
    name: "Luna",
    logo_url: null,
    status: "active" as const,
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

describe("api auth schemas", () => {
  const product = { id: 69, name: "Luna", slug: "luna", role: { id: 1, name: "admin" } };
  const user = {
    name: "Alice",
    email: "alice@example.com",
    role: { id: 1, name: "admin" },
    products: [product],
  };

  it("parses a product", () => {
    expect(() => apiProductSchema.parse(product)).not.toThrow();
  });

  it("parses a user with role null", () => {
    expect(() => apiUserSchema.parse({ ...user, role: null })).not.toThrow();
  });

  it("parses a valid login response", () => {
    expect(() =>
      loginResponseSchema.parse({ access_token: "a", refresh_token: "b", user }),
    ).not.toThrow();
  });

  it("rejects a login response without refresh_token", () => {
    expect(() =>
      loginResponseSchema.parse({ access_token: "a", user }),
    ).toThrow();
  });

  it("parses a me response", () => {
    expect(() => meResponseSchema.parse({ user })).not.toThrow();
  });

  it("parses an sso init response", () => {
    expect(() =>
      ssoInitResponseSchema.parse({ data: { url: "https://sesame.example/redirect" } }),
    ).not.toThrow();
  });

  it("rejects an sso init response with a non-URL", () => {
    expect(() => ssoInitResponseSchema.parse({ data: { url: "not-a-url" } })).toThrow();
  });
});
