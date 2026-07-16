import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import { createRng } from "../rng";
import type { RawAuditEvent, RawPaginatedAudit } from "@/features/audit/schemas";

type Params = Record<string, string | undefined>;

const ACTIONS = [
  "user.ban",
  "user.unban",
  "user.verify",
  "moderation.approve",
  "moderation.reject",
  "moderation.escalate",
  "report.resolve",
  "report.dismiss",
  "settings.update",
  "flag.toggle",
  "subscription.cancel",
  "subscription.refund",
] as const;

const ACTORS = [
  { id: "usr_admin_001", name: "Alice Admin" },
  { id: "usr_admin_002", name: "Bob Moderator" },
  { id: "usr_admin_003", name: "Charlie Ops" },
];

function buildEvents(tenantId: string | null): RawAuditEvent[] {
  const rng = createRng((tenantId?.length ?? 0) * 89 + 3);
  const users = tenantId ? db.usersFor(tenantId).slice(0, 50) : [];
  const count = 100;

  return Array.from({ length: count }, (_, i) => {
    const actor = rng.pick(ACTORS);
    const action = rng.pick(ACTIONS);
    const target = users.length > 0 ? users[rng.int(0, users.length - 1)] : null;
    const hoursAgo = rng.int(1, 720);
    return {
      id: `aud_${i + 1}`,
      actor_name: actor.name,
      actor_id: actor.id,
      action,
      entity_type: action.split(".")[0],
      entity_id: target?.id ?? `entity_${i}`,
      entity_label: target?.display_name ?? "Unknown entity",
      tenant_id: tenantId,
      occurred_at: new Date(Date.now() - hoursAgo * 3_600_000).toISOString(),
      metadata: null,
    };
  });
}

const cache: Record<string, RawAuditEvent[]> = {};

function getEvents(tenantId: string | null): RawAuditEvent[] {
  const key = tenantId ?? "__global__";
  if (!cache[key]) cache[key] = buildEvents(tenantId);
  return cache[key];
}

export function list(tenantId: string | null, params: Params): RawPaginatedAudit {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getEvents(tenantId);
  const action = params.action;
  const search = (params.search ?? "").trim().toLowerCase();
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = items.filter((item) => {
    if (action && action !== "all" && item.action !== action) return false;
    if (search && !item.actor_name.toLowerCase().includes(search) && !item.entity_label.toLowerCase().includes(search)) return false;
    return true;
  });

  const start = page * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, page_size: pageSize };
}

export function listGlobal(params: Params): RawPaginatedAudit {
  const items = getEvents(null);
  const action = params.action;
  const search = (params.search ?? "").trim().toLowerCase();
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = items.filter((item) => {
    if (action && action !== "all" && item.action !== action) return false;
    if (search && !item.actor_name.toLowerCase().includes(search) && !item.entity_label.toLowerCase().includes(search)) return false;
    return true;
  });

  const start = page * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, page_size: pageSize };
}
