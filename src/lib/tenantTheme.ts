import type { TenantTheme } from "@/features/tenants/types";

const DEFAULT_THEME: TenantTheme = {
  primary: "199 89% 48%",
  accent: "174 72% 43%",
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  radius: "0.6rem",
  fontSans: "Inter, system-ui, sans-serif",
};

const CSS_VAR_MAP: Record<keyof TenantTheme, string> = {
  primary: "--primary",
  accent: "--accent",
  background: "--background",
  foreground: "--foreground",
  radius: "--radius",
  fontSans: "--font-sans",
};

export function applyTenantTheme(theme: Partial<TenantTheme> | null): void {
  const root = document.documentElement;
  const merged = { ...DEFAULT_THEME, ...(theme ?? {}) };
  (Object.keys(CSS_VAR_MAP) as (keyof TenantTheme)[]).forEach((key) => {
    root.style.setProperty(CSS_VAR_MAP[key], String(merged[key]));
  });
}

export function resetTenantTheme(): void {
  const root = document.documentElement;
  Object.values(CSS_VAR_MAP).forEach((cssVar) => root.style.removeProperty(cssVar));
}

/**
 * Rough WCAG contrast check between two HSL tokens (space-separated H S% L%).
 * Returns the contrast ratio.
 */
export function contrastRatio(hslA: string, hslB: string): number {
  const l1 = hslLuminance(hslA);
  const l2 = hslLuminance(hslB);
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (light + 0.05) / (dark + 0.05);
}

function hslLuminance(hsl: string): number {
  const [, s, l] = hsl.split(/\s+/).map((v) => parseFloat(v));
  return l / 100 - (s / 100) * 0.05;
}
