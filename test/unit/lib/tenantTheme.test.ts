import { describe, it, expect, afterEach } from "vitest";
import { applyTenantTheme, resetTenantTheme, contrastRatio } from "@/lib/tenantTheme";

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

  it("writes each CSS variable to :root", () => {
    applyTenantTheme({
      primary: "10 20% 30%",
      accent: "40 50% 60%",
      background: "0 0% 100%",
      foreground: "222 47% 11%",
      radius: "0.5rem",
      fontSans: "Arial",
    });
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--primary")).toBe("10 20% 30%");
    expect(root.style.getPropertyValue("--accent")).toBe("40 50% 60%");
    expect(root.style.getPropertyValue("--radius")).toBe("0.5rem");
    expect(root.style.getPropertyValue("--font-sans")).toBe("Arial");
  });

  it("writes the full token surface even when only partial values are provided", () => {
    applyTenantTheme({ primary: "10 20% 30%" });
    const root = document.documentElement;
    for (const cssVar of ALL_VARS) {
      expect(
        root.style.getPropertyValue(cssVar),
        `${cssVar} should have a value`,
      ).not.toBe("");
    }
  });

  it("applies partial extended tokens", () => {
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

  it("falls back to defaults on null", () => {
    applyTenantTheme(null);
    for (const cssVar of ALL_VARS) {
      expect(document.documentElement.style.getPropertyValue(cssVar)).not.toBe("");
    }
  });
});

describe("resetTenantTheme", () => {
  it("removes every tenant CSS variable including the extended surface", () => {
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
