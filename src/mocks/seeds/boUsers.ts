import type { RawBoUser } from "@/features/boUsers/schemas";

const NAMES = [
  "Camille Dubois",
  "Léa Martin",
  "Thomas Bernard",
  "Sarah Lefebvre",
  "Maxime Moreau",
  "Julie Laurent",
  "Antoine Girard",
  "Manuel Rousseau",
  "Claire Vincent",
  "Nicolas Fontaine",
  "Aurélie Lefèvre",
  "Romain Mercier",
];

const ROLES = [
  { id: "admin", name: "Admin", color: "primary" },
  { id: "moderator", name: "Moderator", color: "info" },
  { id: "viewer", name: "Viewer", color: "secondary" },
];

const ALL_PRODUCTS = [
  { id: 101, name: "Woozgo", slug: "woozgo" },
  { id: 102, name: "Weezchat FR", slug: "weezchat-fr" },
  { id: 103, name: "Weezchat CI", slug: "weezchat-ci" },
  { id: 104, name: "Toolov SK", slug: "toolov-sk" },
  { id: 105, name: "Weezchat TG", slug: "weezchat-tg" },
  { id: 106, name: "Swipi", slug: "swipi" },
];

function isoAt(daysAgo: number): string {
  const base = Date.UTC(2025, 6, 15, 12, 0, 0);
  return new Date(base - daysAgo * 86_400_000).toISOString();
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function buildBoUserSeeds(): RawBoUser[] {
  return NAMES.map((name, i) => {
    const productCount = 1 + (i % 3);
    const products = ALL_PRODUCTS.slice(i % ALL_PRODUCTS.length, (i % ALL_PRODUCTS.length) + productCount).map(
      (p) => {
        const role = ROLES[i % ROLES.length];
        return { ...p, role };
      },
    );
    return {
      id: i + 1,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@bo.app`,
      initials: initials(name),
      lastLogin: i % 4 === 0 ? null : isoAt(i),
      products,
    };
  });
}
