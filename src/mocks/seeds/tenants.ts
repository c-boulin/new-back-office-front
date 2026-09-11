import type { RawTenant, RawTenantTheme } from "@/features/tenants/schemas";

const BASE_RADIUS = "1rem";
const BASE_FONT = "Inter, system-ui, sans-serif";

/**
 * Tenant themes only override brand tokens (primary/accent/ring + radius/font).
 * Surface tokens (background/foreground/card/…) come from the base :root and
 * .dark stylesheets in index.css so the global light/dark toggle keeps working
 * for every tenant.
 */
function productTheme(primary: string, accent: string): RawTenantTheme {
  return {
    primary,
    accent,
    background: "",
    foreground: "",
    radius: BASE_RADIUS,
    font_sans: BASE_FONT,
    ring: primary,
  };
}

export const tenantSeeds: RawTenant[] = [
  {
    id: "101",
    slug: "woozgo",
    name: "Woozgo",
    logo_url: null,
    status: "active",
    theme: productTheme("158 34% 52%", "158 34% 62%"),
    feature_flags: { premium: true, moderation: true, video: false, coach_ai: true },
    created_at: "2024-08-12T09:00:00.000Z",
    users_count: 1287,
  },
  {
    id: "102",
    slug: "weezchat-fr",
    name: "Weezchat FR",
    logo_url: null,
    status: "active",
    theme: productTheme("343 74% 56%", "343 74% 68%"),
    feature_flags: { premium: true, moderation: true, video: true, coach_ai: true },
    created_at: "2024-05-01T09:00:00.000Z",
    users_count: 3210,
  },
  {
    id: "103",
    slug: "weezchat-ci",
    name: "Weezchat CI",
    logo_url: null,
    status: "active",
    theme: productTheme("22 88% 55%", "22 88% 68%"),
    feature_flags: { premium: false, moderation: true, video: false, coach_ai: false },
    created_at: "2024-09-10T09:00:00.000Z",
    users_count: 812,
  },
  {
    id: "104",
    slug: "toolov-sk",
    name: "Toolov SK",
    logo_url: null,
    status: "active",
    theme: productTheme("199 84% 47%", "199 84% 62%"),
    feature_flags: { premium: true, moderation: true, video: true, coach_ai: false },
    created_at: "2024-11-20T09:00:00.000Z",
    users_count: 574,
  },
  {
    id: "105",
    slug: "weezchat-tg",
    name: "Weezchat TG",
    logo_url: null,
    status: "active",
    theme: productTheme("48 89% 52%", "48 89% 65%"),
    feature_flags: { premium: false, moderation: true, video: false, coach_ai: false },
    created_at: "2025-01-14T09:00:00.000Z",
    users_count: 341,
  },
  {
    id: "106",
    slug: "swipi",
    name: "Swipi",
    logo_url: null,
    status: "active",
    theme: productTheme("174 65% 40%", "174 65% 55%"),
    feature_flags: { premium: true, moderation: true, video: true, coach_ai: true },
    created_at: "2025-03-01T09:00:00.000Z",
    users_count: 908,
  },
];
