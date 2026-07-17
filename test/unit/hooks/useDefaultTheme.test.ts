import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDefaultTheme } from "@/hooks/useDefaultTheme";
import { applyTenantTheme, resetTenantTheme } from "@/lib/tenantTheme";

const TOKENS = [
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

describe("useDefaultTheme", () => {
  beforeEach(() => {
    resetTenantTheme();
  });

  it("clears every tenant CSS variable on mount", () => {
    applyTenantTheme({
      primary: "199 89% 55%",
      accent: "174 72% 48%",
      background: "222 47% 6%",
      foreground: "210 40% 98%",
      radius: "0.75rem",
      fontSans: "Inter",
      card: "222 47% 8%",
      cardForeground: "210 40% 98%",
    });
    const root = document.documentElement;
    expect(root.style.getPropertyValue("--background")).toBe("222 47% 6%");
    expect(root.style.getPropertyValue("--card")).toBe("222 47% 8%");

    renderHook(() => useDefaultTheme());

    for (const token of TOKENS) {
      expect(root.style.getPropertyValue(token), `${token} should be cleared`).toBe("");
    }
  });

  it("re-renders do not re-apply anything", () => {
    const { rerender } = renderHook(() => useDefaultTheme());
    applyTenantTheme({
      primary: "1 2% 3%",
      accent: "1 2% 3%",
      background: "1 2% 3%",
      foreground: "1 2% 3%",
      radius: "0.5rem",
      fontSans: "Inter",
    });
    rerender();
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      "1 2% 3%",
    );
  });

  it("unmount is a no-op", () => {
    const { unmount } = renderHook(() => useDefaultTheme());
    applyTenantTheme({
      primary: "1 2% 3%",
      accent: "1 2% 3%",
      background: "1 2% 3%",
      foreground: "1 2% 3%",
      radius: "0.5rem",
      fontSans: "Inter",
    });
    unmount();
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      "1 2% 3%",
    );
  });
});
