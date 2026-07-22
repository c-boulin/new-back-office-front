export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  hue: string;
  accent: string;
};

/**
 * Static catalog of products exposed on the login screen. Order and colours
 * match the productTheme() seeds in src/mocks/seeds/tenants.ts.
 */
export const PRODUCT_CATALOG: readonly CatalogProduct[] = [
  { id: 101, slug: "woozgo", name: "Woozgo", hue: "158 34% 52%", accent: "158 34% 62%" },
  { id: 102, slug: "weezchat-fr", name: "Weezchat FR", hue: "343 74% 56%", accent: "343 74% 68%" },
  { id: 103, slug: "weezchat-ci", name: "Weezchat CI", hue: "22 88% 55%", accent: "22 88% 68%" },
  { id: 104, slug: "toolov-sk", name: "Toolov SK", hue: "199 84% 47%", accent: "199 84% 62%" },
  { id: 105, slug: "weezchat-tg", name: "Weezchat TG", hue: "48 89% 52%", accent: "48 89% 65%" },
  { id: 106, slug: "swipi", name: "Swipi", hue: "174 65% 40%", accent: "174 65% 55%" },
];

export function findProduct(idOrSlug: number | string): CatalogProduct | undefined {
  return PRODUCT_CATALOG.find(
    (p) => p.id === idOrSlug || p.slug === idOrSlug || String(p.id) === String(idOrSlug),
  );
}
