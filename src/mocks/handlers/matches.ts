import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import { createRng } from "../rng";
import type { RawMatch, RawPaginatedMatches } from "@/features/matches/schemas";

type Params = Record<string, string | undefined>;

function buildMatches(tenantId: string): RawMatch[] {
  const users = db.usersFor(tenantId);
  const rng = createRng(tenantId.length * 23 + 77);
  const count = Math.min(80, Math.floor(users.length / 2));
  return Array.from({ length: count }, (_, i) => {
    const a = users[rng.int(0, users.length - 1)];
    let bIdx = rng.int(0, users.length - 1);
    if (bIdx === users.indexOf(a)) bIdx = (bIdx + 1) % users.length;
    const b = users[bIdx];
    const daysAgo = rng.int(0, 90);
    const hasMessage = rng.bool(0.7);
    return {
      id: `mtch_${tenantId}_${String(i + 1).padStart(4, "0")}`,
      user_a_name: a.display_name,
      user_a_id: a.id,
      user_a_avatar_url: a.avatar_url,
      user_b_name: b.display_name,
      user_b_id: b.id,
      user_b_avatar_url: b.avatar_url,
      matched_at: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      first_message_at: hasMessage ? new Date(Date.now() - (daysAgo - rng.int(0, 2)) * 86_400_000).toISOString() : null,
      conversation_length: hasMessage ? rng.int(1, 150) : 0,
      is_active: rng.bool(0.6),
    };
  });
}

const cache: Record<string, RawMatch[]> = {};

function getMatches(tenantId: string): RawMatch[] {
  if (!cache[tenantId]) cache[tenantId] = buildMatches(tenantId);
  return cache[tenantId];
}

export function list(tenantId: string | null, params: Params): RawPaginatedMatches {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getMatches(tenantId);
  const search = (params.search ?? "").trim().toLowerCase();
  const active = params.active;
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = items.filter((item) => {
    if (active === "true" && !item.is_active) return false;
    if (active === "false" && item.is_active) return false;
    if (search && !item.user_a_name.toLowerCase().includes(search) && !item.user_b_name.toLowerCase().includes(search)) return false;
    return true;
  });

  const start = page * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, page_size: pageSize };
}
