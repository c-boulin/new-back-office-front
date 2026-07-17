import type { TenantTheme } from "@/features/tenants/types";

type ResolvedTheme = Required<TenantTheme>;

const DEFAULT_THEME: ResolvedTheme = {
  primary: "199 89% 48%",
  accent: "174 72% 43%",
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  radius: "0.6rem",
  fontSans: "Inter, system-ui, sans-serif",
  card: "0 0% 100%",
  cardForeground: "222 47% 11%",
  popover: "0 0% 100%",
  popoverForeground: "222 47% 11%",
  secondary: "210 40% 96%",
  secondaryForeground: "222 47% 11%",
  muted: "210 40% 96%",
  mutedForeground: "215 16% 47%",
  border: "214 32% 91%",
  input: "214 32% 91%",
  ring: "199 89% 48%",
  primaryForeground: "210 40% 98%",
  accentForeground: "210 40% 98%",
};

const CSS_VAR_MAP: Record<keyof ResolvedTheme, string> = {
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

function mergeWithDefaults(theme: Partial<TenantTheme> | null): ResolvedTheme {
  if (!theme) return { ...DEFAULT_THEME };
  const merged = { ...DEFAULT_THEME } as ResolvedTheme;
  (Object.keys(CSS_VAR_MAP) as (keyof ResolvedTheme)[]).forEach((key) => {
    const value = theme[key];
    if (typeof value === "string" && value.length > 0) {
      merged[key] = value;
    }
  });
  return merged;
}

const WARNED_PRIMARIES = new Set<string>();

export function __resetContrastWarnCacheForTests(): void {
  WARNED_PRIMARIES.clear();
}

function warnLowContrast(theme: ResolvedTheme): void {
  const primaryPair = contrastRatio(theme.primary, theme.primaryForeground);
  const surfacePair = contrastRatio(theme.background, theme.foreground);
  if (primaryPair >= 4.5 && surfacePair >= 4.5) return;
  if (WARNED_PRIMARIES.has(theme.primary)) return;
  WARNED_PRIMARIES.add(theme.primary);
  console.warn(
    `[tenantTheme] low WCAG contrast — primary/primary-foreground=${primaryPair.toFixed(2)}, background/foreground=${surfacePair.toFixed(2)} (target >= 4.5)`,
  );
}

export function applyTenantTheme(theme: Partial<TenantTheme> | null): void {
  const root = document.documentElement;
  const merged = mergeWithDefaults(theme);
  (Object.keys(CSS_VAR_MAP) as (keyof ResolvedTheme)[]).forEach((key) => {
    root.style.setProperty(CSS_VAR_MAP[key], merged[key]);
  });
  if (import.meta.env.DEV) {
    warnLowContrast(merged);
  }
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
