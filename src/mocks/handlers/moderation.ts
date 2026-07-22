import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type {
  RawModerationItem,
  RawModerationStats,
  RawPaginatedModeration,
} from "@/features/moderation/schemas";

type Params = Record<string, string | undefined>;

function requireTenant(tenantId: string | null): string {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  return tenantId;
}

function inferKind(m: RawModerationItem): string {
  if (m.content_kind) return m.content_kind;
  if (m.type === "profile") return "nickname";
  if (m.type === "photo") return "profile_photo";
  if (m.type === "message") return "message";
  return "story";
}

export function list(tenantId: string | null, params: Params): RawPaginatedModeration {
  const scope = requireTenant(tenantId);
  const status = params.status;
  const type = params.type;
  const kind = params.kind;
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = db.moderationFor(scope).filter((m) => {
    if (status && status !== "all" && m.status !== status) return false;
    if (type && type !== "all" && m.type !== type) return false;
    if (kind && kind !== "all" && inferKind(m) !== kind) return false;
    return true;
  });
  const start = page * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    page_size: pageSize,
  };
}

export function stats(tenantId: string | null): RawModerationStats {
  const scope = requireTenant(tenantId);
  const items = db.moderationFor(scope);
  let pending = 0;
  let confirmed = 0;
  let reverted = 0;
  let aiRefused = 0;
  let aiAccepted = 0;
  for (const m of items) {
    if (m.status === "pending") pending += 1;
    if (m.status === "approved") confirmed += 1;
    if (m.status === "rejected") reverted += 1;
    if (m.ai_decision === "refused") aiRefused += 1;
    if (m.ai_decision === "accepted") aiAccepted += 1;
  }
  return {
    total_processed: items.length,
    pending,
    confirmed,
    reverted,
    ai_refused: aiRefused,
    ai_accepted: aiAccepted,
  };
}

export function approve(tenantId: string | null, id: string): { ok: true } {
  const scope = requireTenant(tenantId);
  const next = db.updateModeration(scope, id, { status: "approved" });
  if (!next) throw new AppError("not_found", "Moderation item not found", 404);
  return { ok: true };
}

export function reject(tenantId: string | null, id: string, reason: string): { ok: true } {
  const scope = requireTenant(tenantId);
  const next = db.updateModeration(scope, id, { status: "rejected", reason });
  if (!next) throw new AppError("not_found", "Moderation item not found", 404);
  return { ok: true };
}

export function escalate(tenantId: string | null, id: string): { ok: true } {
  const scope = requireTenant(tenantId);
  const next = db.updateModeration(scope, id, { status: "escalated" });
  if (!next) throw new AppError("not_found", "Moderation item not found", 404);
  return { ok: true };
}
