import type { TenantTheme } from "@/features/tenants/types";

const CSS_VAR_MAP: Record<keyof TenantTheme, string> = {
  primary: "--primary",
  accent: "--accent",
  background: "--background",
  foreground: "--foreground",
  radius: "--radius",
  fontSans: "--font-sans",
  card: "--card",
  cardForeground: "--card-foreground",
  popover: "--popover",
  popoverForeground: "--popover-foreground",
  secondary: "--secondary",
  secondaryForeground: "--secondary-foreground",
  muted: "--muted",
  mutedForeground: "--muted-foreground",
  border: "--border",
  input: "--input",
  ring: "--ring",
  primaryForeground: "--primary-foreground",
  accentForeground: "--accent-foreground",
};

const WARNED_PRIMARIES = new Set<string>();

export function __resetContrastWarnCacheForTests(): void {
  WARNED_PRIMARIES.clear();
}

function warnLowContrast(theme: Partial<TenantTheme>): void {
  const p = theme.primary;
  const pf = theme.primaryForeground;
  const bg = theme.background;
  const fg = theme.foreground;
  if (!p || !pf || !bg || !fg) return;
  const primaryPair = contrastRatio(p, pf);
  const surfacePair = contrastRatio(bg, fg);
  if (primaryPair >= 4.5 && surfacePair >= 4.5) return;
  if (WARNED_PRIMARIES.has(p)) return;
  WARNED_PRIMARIES.add(p);
  console.warn(
    `[tenantTheme] low WCAG contrast — primary/primary-foreground=${primaryPair.toFixed(2)}, background/foreground=${surfacePair.toFixed(2)} (target >= 4.5)`,
  );
}

export function applyTenantTheme(theme: Partial<TenantTheme> | null): void {
  const root = document.documentElement;
  if (!theme) {
    resetTenantTheme();
    return;
  }
  (Object.keys(CSS_VAR_MAP) as (keyof TenantTheme)[]).forEach((key) => {
    const value = theme[key];
    if (typeof value === "string" && value.length > 0) {
      root.style.setProperty(CSS_VAR_MAP[key], value);
    }
  });
  if (import.meta.env.DEV) {
    warnLowContrast(theme);
  }
}

export function resetTenantTheme(): void {
  const root = document.documentElement;
  Object.values(CSS_VAR_MAP).forEach((cssVar) => root.style.removeProperty(cssVar));
}

/**
 * Rough WCAG contrast check between two HSL tokens (space-separated H S% L%).
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
