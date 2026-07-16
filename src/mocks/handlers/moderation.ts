import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import { createRng } from "../rng";
import type { RawModerationItem, RawPaginatedModeration } from "@/features/moderation/schemas";

type Params = Record<string, string | undefined>;

const TYPES: RawModerationItem["type"][] = ["photo", "bio", "message", "profile"];
const STATUSES: RawModerationItem["status"][] = ["pending", "pending", "pending", "approved", "rejected", "escalated"];
const REASONS = [
  "Inappropriate content",
  "Spam or advertising",
  "Fake profile suspected",
  "Offensive language",
  "Nudity or sexual content",
  "Harassment",
  "Underage suspected",
  "Impersonation",
];
const CONTENTS = [
  "Profile photo uploaded",
  "Bio text updated: 'Looking for fun times...'",
  "Message flagged by recipient",
  "Profile description contains suspicious links",
  "Photo appears to be AI-generated",
  "Bio contains contact information",
  "Message contains threatening language",
  "Profile name appears fake",
];

function buildItems(tenantId: string): RawModerationItem[] {
  const users = db.usersFor(tenantId);
  const rng = createRng(tenantId.length * 31 + 99);
  const count = Math.min(60, users.length);
  return Array.from({ length: count }, (_, i) => {
    const user = users[rng.int(0, users.length - 1)];
    const status = rng.pick(STATUSES);
    const daysAgo = rng.int(0, 30);
    return {
      id: `mod_${tenantId}_${String(i + 1).padStart(4, "0")}`,
      user_id: user.id,
      user_display_name: user.display_name,
      user_avatar_url: user.avatar_url,
      type: rng.pick(TYPES),
      content: rng.pick(CONTENTS),
      reason: rng.pick(REASONS),
      status,
      reported_at: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      reviewed_at: status !== "pending" ? new Date(Date.now() - rng.int(0, daysAgo) * 86_400_000).toISOString() : null,
      reviewed_by: status !== "pending" ? "System Moderator" : null,
    };
  });
}

const cache: Record<string, RawModerationItem[]> = {};

function getItems(tenantId: string): RawModerationItem[] {
  if (!cache[tenantId]) cache[tenantId] = buildItems(tenantId);
  return cache[tenantId];
}

export function list(tenantId: string | null, params: Params): RawPaginatedModeration {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getItems(tenantId);
  const type = params.type;
  const status = params.status;
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = items.filter((item) => {
    if (type && type !== "all" && item.type !== type) return false;
    if (status && status !== "all" && item.status !== status) return false;
    return true;
  });

  const start = page * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, page_size: pageSize };
}

export function approve(tenantId: string | null, id: string): RawModerationItem {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getItems(tenantId);
  const item = items.find((i) => i.id === id);
  if (!item) throw new AppError("not_found", "Item not found", 404);
  item.status = "approved";
  item.reviewed_at = new Date().toISOString();
  item.reviewed_by = "Current User";
  return item;
}

export function reject(tenantId: string | null, id: string): RawModerationItem {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getItems(tenantId);
  const item = items.find((i) => i.id === id);
  if (!item) throw new AppError("not_found", "Item not found", 404);
  item.status = "rejected";
  item.reviewed_at = new Date().toISOString();
  item.reviewed_by = "Current User";
  return item;
}

export function escalate(tenantId: string | null, id: string): RawModerationItem {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getItems(tenantId);
  const item = items.find((i) => i.id === id);
  if (!item) throw new AppError("not_found", "Item not found", 404);
  item.status = "escalated";
  item.reviewed_at = new Date().toISOString();
  item.reviewed_by = "Current User";
  return item;
}
