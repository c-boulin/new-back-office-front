import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  applyTenantTheme,
  applyBrandThemeForTenant,
  brandThemeForTenant,
  resetTenantTheme,
  contrastRatio,
  __resetContrastWarnCacheForTests,
} from "@/lib/tenantTheme";
import { useProductsStore } from "@/stores/productsStore";
import { rawProductToProduct } from "@/features/auth/products";

const ALL_VARS = [
  "--primary",
  "--accent",
  "--background",
  "--foreground",
  "--radius",
  "--font-sans",
  "--card",
  "--card-foreground",
  "--popover",
  "--popover-foreground",
  "--secondary",
  "--secondary-foreground",
  "--muted",
  "--muted-foreground",
  "--border",
  "--input",
  "--ring",
  "--primary-foreground",
  "--accent-foreground",
];

describe("applyTenantTheme", () => {
  afterEach(() => {
    resetTenantTheme();
  });

  it("writes only the provided CSS variables and leaves others untouched", () => {
    applyTenantTheme({
      primary: "10 20% 30%",
      accent: "40 50% 60%",
      ring: "10 20% 30%",
      radius: "0.5rem",
      fontSans: "Arial",
    });
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--primary")).toBe("10 20% 30%");
    expect(root.style.getPropertyValue("--accent")).toBe("40 50% 60%");
    expect(root.style.getPropertyValue("--ring")).toBe("10 20% 30%");
    expect(root.style.getPropertyValue("--radius")).toBe("0.5rem");
    expect(root.style.getPropertyValue("--font-sans")).toBe("Arial");
    expect(root.style.getPropertyValue("--background")).toBe("");
    expect(root.style.getPropertyValue("--foreground")).toBe("");
    expect(root.style.getPropertyValue("--card")).toBe("");
  });

  it("does not force any variable when only partial values are provided", () => {
    applyTenantTheme({ primary: "10 20% 30%" });
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--primary")).toBe("10 20% 30%");
    expect(root.style.getPropertyValue("--background")).toBe("");
    expect(root.style.getPropertyValue("--radius")).toBe("");
  });

  it("applies extended tokens when provided", () => {
    applyTenantTheme({
      primary: "1 2% 3%",
      card: "222 47% 8%",
      cardForeground: "210 40% 98%",
      border: "217 33% 22%",
    });
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--card")).toBe("222 47% 8%");
    expect(root.style.getPropertyValue("--card-foreground")).toBe("210 40% 98%");
    expect(root.style.getPropertyValue("--border")).toBe("217 33% 22%");
  });

  it("resets tenant overrides when called with null", () => {
    applyTenantTheme({ primary: "1 2% 3%" });
    applyTenantTheme(null);
    for (const cssVar of ALL_VARS) {
      expect(document.documentElement.style.getPropertyValue(cssVar)).toBe("");
    }
  });
});

describe("resetTenantTheme", () => {
  it("removes every tenant CSS variable that was pushed", () => {
    applyTenantTheme({ primary: "1 2% 3%", card: "222 47% 8%" });
    resetTenantTheme();
    for (const cssVar of ALL_VARS) {
      expect(document.documentElement.style.getPropertyValue(cssVar)).toBe("");
    }
  });
});

describe("contrastRatio", () => {
  it("returns a positive number", () => {
    expect(contrastRatio("0 0% 100%", "0 0% 0%")).toBeGreaterThan(0);
  });

  it("is symmetric across argument order", () => {
    const a = contrastRatio("0 0% 100%", "0 0% 0%");
    const b = contrastRatio("0 0% 0%", "0 0% 100%");
    expect(a).toBeCloseTo(b);
  });
});

describe("applyTenantTheme dev-only contrast warning", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    __resetContrastWarnCacheForTests();
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
    resetTenantTheme();
  });

  it("warns exactly once for a low-contrast palette (deduped by primary)", () => {
    const badPalette = {
      primary: "0 0% 55%",
      primaryForeground: "0 0% 60%",
      background: "0 0% 55%",
      foreground: "0 0% 60%",
      accent: "0 0% 55%",
      accentForeground: "0 0% 60%",
      radius: "0.5rem",
      fontSans: "Inter",
    };
    applyTenantTheme(badPalette);
    applyTenantTheme(badPalette);
    applyTenantTheme(badPalette);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0]?.[0]).toMatch(/low WCAG contrast/i);
  });

  it("does not warn for a compliant palette", () => {
    const goodPalette = {
      primary: "0 0% 10%",
      primaryForeground: "0 0% 100%",
      background: "0 0% 100%",
      foreground: "0 0% 0%",
      accent: "0 0% 10%",
      accentForeground: "0 0% 100%",
      radius: "0.5rem",
      fontSans: "Inter",
    };
    applyTenantTheme(goodPalette);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("skips the warning when required tokens are missing", () => {
      applyTenantTheme({ primary: "0 0% 55%" });
      expect(warnSpy).not.toHaveBeenCalled();
    });
});

describe("brandThemeForTenant", () => {
  afterEach(() => {
    useProductsStore.getState().clear();
    resetTenantTheme();
  });

  it("uses the cached product color from the products store when available", () => {
    useProductsStore.getState().setProducts([
      rawProductToProduct({ id: 42, name: "Custom", slug: "custom", color: "#199fe0" }),
    ]);
    const theme = brandThemeForTenant("42", "custom");
    expect(theme.primary).toMatch(/^\d+ \d+% \d+%$/);
    expect(theme.primary).toBe(theme.ring);
    expect(theme.primaryForeground).toBe("0 0% 100%");
    expect(theme.background).toBeUndefined();
    expect(theme.foreground).toBeUndefined();
    expect(theme.card).toBeUndefined();
  });

  it("falls back to the slug-derived pair when the tenant isn't cached", () => {
    const theme = brandThemeForTenant("101", "woozgo");
    expect(theme.primary).toBe("158 34% 52%");
    expect(theme.accent).toBe("158 34% 62%");
  });
});

describe("applyBrandThemeForTenant", () => {
  afterEach(() => {
    useProductsStore.getState().clear();
    resetTenantTheme();
  });

  it("writes only brand tokens (leaving surface variables alone)", () => {
    applyBrandThemeForTenant("101", "woozgo");
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--primary")).toBe("158 34% 52%");
    expect(root.style.getPropertyValue("--accent")).toBe("158 34% 62%");
    expect(root.style.getPropertyValue("--ring")).toBe("158 34% 52%");
    expect(root.style.getPropertyValue("--primary-foreground")).toBe("0 0% 100%");
    expect(root.style.getPropertyValue("--background")).toBe("");
    expect(root.style.getPropertyValue("--foreground")).toBe("");
    expect(root.style.getPropertyValue("--card")).toBe("");
  });

  it("clears any prior full-theme override before applying", () => {
    applyTenantTheme({ background: "0 0% 5%", foreground: "0 0% 95%", card: "0 0% 10%" });
    applyBrandThemeForTenant("101", "woozgo");
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--background")).toBe("");
    expect(root.style.getPropertyValue("--foreground")).toBe("");
    expect(root.style.getPropertyValue("--card")).toBe("");
    expect(root.style.getPropertyValue("--primary")).toBe("158 34% 52%");
  });
});
