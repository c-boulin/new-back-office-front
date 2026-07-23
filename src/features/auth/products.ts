import type { TenantMembership } from "@/features/tenants/types";
import type { RawApiProduct } from "@/features/tenants/schemas";

export type Product = {
  id: number;
  name: string;
  slug: string | null;
  /** Raw hex/HSL string from the backend (if any). Kept for reference / debugging. */
  color: string | null;
  /** HSL triplet ("H S% L%") used for the brand primary. */
  hue: string;
  /** HSL triplet ("H S% L%") used for the brand accent (lighter variant of `hue`). */
  accent: string;
};

const KNOWN_COLORS: Record<string, { hue: string; accent: string }> = {
  woozgo: { hue: "158 34% 52%", accent: "158 34% 62%" },
  "weezchat-fr": { hue: "343 74% 56%", accent: "343 74% 68%" },
  "weezchat-ci": { hue: "22 88% 55%", accent: "22 88% 68%" },
  "toolov-sk": { hue: "199 84% 47%", accent: "199 84% 62%" },
  "weezchat-tg": { hue: "48 89% 52%", accent: "48 89% 65%" },
  swipi: { hue: "174 65% 40%", accent: "174 65% 55%" },
};

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

// Bands avoid the violet range (260-300) to respect the no-purple design rule.
const DERIVED_HUE_BANDS: ReadonlyArray<readonly [number, number]> = [
  [0, 60],
  [90, 220],
  [305, 360],
];

function deriveHue(seed: string): number {
  const total = DERIVED_HUE_BANDS.reduce((n, [a, b]) => n + (b - a), 0);
  let cursor = hashString(seed) % total;
  for (const [a, b] of DERIVED_HUE_BANDS) {
    const span = b - a;
    if (cursor < span) return a + cursor;
    cursor -= span;
  }
  return DERIVED_HUE_BANDS[0][0];
}

function expandShortHex(hex: string): string {
  return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
}

/**
 * Parse a `#RRGGBB` / `#RGB` hex string into an HSL triplet formatted like
 * "H S% L%" — the shape Tailwind expects for a `hsl(var(--primary))` binding.
 * Returns `null` on any parse failure (unknown format, out-of-range values, …).
 */
export function hexToHslTriplet(hex: string): string | null {
  if (typeof hex !== "string") return null;
  const trimmed = hex.trim();
  const normalized = /^#[0-9a-fA-F]{3}$/.test(trimmed) ? expandShortHex(trimmed) : trimmed;
  if (!/^#[0-9a-fA-F]{6}$/.test(normalized)) return null;

  const r = parseInt(normalized.slice(1, 3), 16) / 255;
  const g = parseInt(normalized.slice(3, 5), 16) / 255;
  const b = parseInt(normalized.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Given an HSL triplet "H S% L%", return a lighter/desaturated companion tone
 * suitable as a brand `accent` next to the primary.
 */
export function lightenTriplet(triplet: string): string {
  const parts = triplet.trim().split(/\s+/);
  if (parts.length !== 3) return triplet;
  const h = parts[0];
  const s = parseInt(parts[1], 10);
  const l = parseInt(parts[2], 10);
  if (!Number.isFinite(s) || !Number.isFinite(l)) return triplet;
  const nextL = Math.min(l + 12, 82);
  return `${h} ${s}% ${nextL}%`;
}

function tripletFromServerColor(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.startsWith("#")) return hexToHslTriplet(trimmed);
  // Accept a bare HSL triplet as-is when it already matches "H S% L%".
  if (/^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/.test(trimmed)) return trimmed;
  return null;
}

export function productColors(
  idOrSlug: number | string,
  slug?: string | null,
  serverColor?: string | null,
): { hue: string; accent: string } {
  if (serverColor) {
    const triplet = tripletFromServerColor(serverColor);
    if (triplet) return { hue: triplet, accent: lightenTriplet(triplet) };
  }
  const key = typeof slug === "string" && slug.length > 0 ? slug : String(idOrSlug);
  const known = KNOWN_COLORS[key];
  if (known) return known;
  const hue = deriveHue(key);
  return {
    hue: `${hue} 68% 50%`,
    accent: `${hue} 68% 62%`,
  };
}

/** Build a UI `Product` from a raw API product returned by /v1/auth/{login,me}. */
export function apiProductToProduct(raw: RawApiProduct): Product {
  const slug = raw.slug && raw.slug.length > 0 ? raw.slug : null;
  const { hue, accent } = productColors(raw.id, slug, null);
  return {
    id: raw.id,
    name: raw.name,
    slug,
    color: null,
    hue,
    accent,
  };
}

/** Build a UI `Product` from a `TenantMembership` (cached in the auth store). */
export function membershipToProduct(m: TenantMembership): Product {
  const numericId = Number(m.tenantId);
  const id = Number.isFinite(numericId) ? numericId : 0;
  const { hue, accent } = productColors(id || m.tenantId, m.tenantSlug, null);
  return {
    id,
    name: m.tenantName,
    slug: m.tenantSlug,
    color: null,
    hue,
    accent,
  };
}
