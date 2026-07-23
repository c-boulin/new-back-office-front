import { z } from "zod";
import { validateAndAdapt } from "@/lib/validatorAdaptor";

export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().nullable(),
});

export const productsResponseSchema = z.object({
  data: z.array(productSchema),
});

export type RawProduct = z.infer<typeof productSchema>;
export type RawProductsResponse = z.infer<typeof productsResponseSchema>;

export type Product = {
  id: number;
  name: string;
  slug: string | null;
  hue: string;
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

export function productColors(
  idOrSlug: number | string,
  slug?: string | null,
): { hue: string; accent: string } {
  const key = typeof slug === "string" && slug.length > 0 ? slug : String(idOrSlug);
  const known = KNOWN_COLORS[key];
  if (known) return known;
  const hue = deriveHue(key);
  return {
    hue: `${hue} 68% 50%`,
    accent: `${hue} 68% 62%`,
  };
}

export function rawProductToProduct(raw: RawProduct): Product {
  const { hue, accent } = productColors(raw.id, raw.slug);
  return { id: raw.id, name: raw.name, slug: raw.slug, hue, accent };
}

export function productsResponseToList(raw: RawProductsResponse): Product[] {
  return raw.data.map(rawProductToProduct);
}

export function parseProducts(raw: unknown): Product[] {
  return validateAndAdapt(raw, productsResponseSchema, productsResponseToList);
}
