import type { RawUserRecord } from "@/features/users/schemas";
import { createRng } from "../rng";

const FIRST_NAMES = [
  "Amelia", "Liam", "Olivia", "Noah", "Emma", "Kai", "Sophie", "Mateo",
  "Zara", "Elias", "Nora", "Ethan", "Aria", "Leo", "Mila", "Hugo",
  "Ivy", "Oscar", "Yuki", "Rafael", "Chloe", "Jasper", "Nia", "Otis",
  "Lena", "Sami", "Iris", "Diego", "Maya", "Theo",
];
const LAST_NAMES = [
  "Rivera", "Chen", "Nakamura", "Kowalski", "Bianchi", "Silva", "Andersen",
  "Okafor", "Larsen", "Dubois", "Reyes", "Adebayo", "Fischer", "Morales",
  "Petrov", "Costa", "Haddad", "Iversen", "Rossi", "Bergman",
];
const CITIES = [
  { city: "Paris", country: "FR" },
  { city: "Berlin", country: "DE" },
  { city: "Amsterdam", country: "NL" },
  { city: "Madrid", country: "ES" },
  { city: "Milan", country: "IT" },
  { city: "Lisbon", country: "PT" },
  { city: "Copenhagen", country: "DK" },
  { city: "Warsaw", country: "PL" },
  { city: "Dublin", country: "IE" },
  { city: "Athens", country: "GR" },
  { city: "Oslo", country: "NO" },
  { city: "Vienna", country: "AT" },
];
const STATUSES: RawUserRecord["status"][] = [
  "active", "active", "active", "active", "active", "active",
  "unverified", "unverified", "banned", "shadow_banned",
];

function isoAt(daysAgo: number, hoursAgo = 0): string {
  const base = Date.UTC(2025, 6, 15, 12, 0, 0);
  return new Date(base - daysAgo * 86_400_000 - hoursAgo * 3_600_000).toISOString();
}

export function buildUserSeeds(tenantId: string, seed: number, count: number): RawUserRecord[] {
  const rng = createRng(seed);
  return Array.from({ length: count }, (_, index) => {
    const first = rng.pick(FIRST_NAMES);
    const last = rng.pick(LAST_NAMES);
    const location = rng.pick(CITIES);
    const status = rng.pick(STATUSES);
    const daysAgo = rng.int(1, 540);
    const lastActive = status === "deleted" ? null : isoAt(rng.int(0, 30), rng.int(0, 23));
    return {
      id: `usr_${tenantId}_${String(index + 1).padStart(4, "0")}`,
      display_name: `${first} ${last}`,
      email: `${first}.${last}.${index}@example.com`.toLowerCase(),
      avatar_url: null,
      status,
      is_verified: status !== "unverified" && rng.bool(0.8),
      is_premium: rng.bool(0.28),
      report_count: status === "banned" ? rng.int(3, 12) : rng.int(0, 3),
      matches_count: rng.int(0, 220),
      created_at: isoAt(daysAgo),
      last_active_at: lastActive,
      city: location.city,
      country: location.country,
    };
  });
}
