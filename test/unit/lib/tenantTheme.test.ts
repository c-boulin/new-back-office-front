import { describe, it, expect, afterEach } from "vitest";
import { applyTenantTheme, resetTenantTheme, contrastRatio } from "@/lib/tenantTheme";

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

  it("falls back to defaults on null", () => {
    applyTenantTheme(null);
    expect(document.documentElement.style.getPropertyValue("--primary")).not.toBe("");
  });

  it("merges partial theme with defaults", () => {
    applyTenantTheme({ primary: "1 2% 3%" });
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--primary")).toBe("1 2% 3%");
    expect(root.style.getPropertyValue("--accent")).not.toBe("");
  });
});

describe("resetTenantTheme", () => {
  it("removes every tenant CSS variable", () => {
    applyTenantTheme({ primary: "1 2% 3%" });
    resetTenantTheme();
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("");
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
