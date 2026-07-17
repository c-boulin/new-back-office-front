import type { RawTenant, RawTenantTheme } from "@/features/tenants/schemas";

const darkSurface: Omit<RawTenantTheme, "primary" | "accent" | "radius" | "font_sans" | "background" | "foreground"> = {
  card: "222 47% 8%",
  card_foreground: "210 40% 98%",
  popover: "222 47% 8%",
  popover_foreground: "210 40% 98%",
  secondary: "217 33% 17%",
  secondary_foreground: "210 40% 98%",
  muted: "217 33% 17%",
  muted_foreground: "215 20% 65%",
  border: "217 33% 22%",
  input: "217 33% 22%",
  primary_foreground: "222 47% 11%",
  accent_foreground: "222 47% 11%",
};

function darkTheme(primary: string, accent: string): RawTenantTheme {
  return {
    primary,
    accent,
    background: "222 47% 6%",
    foreground: "210 40% 98%",
    radius: "0.75rem",
    font_sans: "Inter, system-ui, sans-serif",
    ring: primary,
    ...darkSurface,
  };
}

export const tenantSeeds: RawTenant[] = [
  {
    id: "tnt_luna",
    slug: "luna",
    name: "Luna",
    logo_url: null,
    status: "active",
    theme: darkTheme("199 89% 55%", "174 72% 48%"),
    feature_flags: { premium: true, moderation: true, video: false },
    created_at: "2024-08-12T09:00:00.000Z",
    users_count: 82,
  },
  {
    id: "tnt_orbit",
    slug: "orbit",
    name: "Orbit",
    logo_url: null,
    status: "active",
    theme: darkTheme("162 63% 41%", "35 92% 55%"),
    feature_flags: { premium: true, moderation: true, video: true },
    created_at: "2024-11-01T09:00:00.000Z",
    users_count: 46,
  },
  {
    id: "tnt_nova",
    slug: "nova",
    name: "Nova",
    logo_url: null,
    status: "provisioning",
    theme: darkTheme("12 88% 58%", "45 92% 55%"),
    feature_flags: { premium: false, moderation: true, video: false },
    created_at: "2025-02-19T09:00:00.000Z",
    users_count: 0,
  },
  {
    id: "tnt_atlas",
    slug: "atlas",
    name: "Atlas",
    logo_url: null,
    status: "suspended",
    theme: darkTheme("220 76% 55%", "195 76% 55%"),
    feature_flags: { premium: true, moderation: false, video: false },
    created_at: "2023-05-10T09:00:00.000Z",
    users_count: 12,
  },
];
