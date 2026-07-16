import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import { createRng } from "../rng";
import type { RawReport, RawPaginatedReports } from "@/features/reports/schemas";

type Params = Record<string, string | undefined>;

const REASONS: RawReport["reason"][] = ["harassment", "spam", "fake_profile", "inappropriate_content", "underage", "scam", "other"];
const STATUSES: RawReport["status"][] = ["open", "open", "open", "investigating", "resolved", "dismissed"];
const DESCRIPTIONS = [
  "This user sent me threatening messages repeatedly.",
  "Clearly a bot account posting spam links.",
  "Photos are stolen from a celebrity's social media.",
  "Explicit content in their profile bio.",
  "Claims to be 25 but conversation suggests otherwise.",
  "Trying to get me to invest in cryptocurrency.",
  "Keeps creating new accounts after being banned.",
  "Using fake photos and catfishing other users.",
];

function buildReports(tenantId: string): RawReport[] {
  const users = db.usersFor(tenantId);
  const rng = createRng(tenantId.length * 17 + 53);
  const count = Math.min(45, users.length);
  return Array.from({ length: count }, (_, i) => {
    const reporter = users[rng.int(0, users.length - 1)];
    const target = users[rng.int(0, users.length - 1)];
    const status = rng.pick(STATUSES);
    const daysAgo = rng.int(0, 60);
    return {
      id: `rpt_${tenantId}_${String(i + 1).padStart(4, "0")}`,
      reporter_name: reporter.display_name,
      reporter_id: reporter.id,
      target_name: target.display_name,
      target_id: target.id,
      reason: rng.pick(REASONS),
      description: rng.pick(DESCRIPTIONS),
      status,
      created_at: new Date(Date.now() - daysAgo * 86_400_000).toISOString(),
      updated_at: new Date(Date.now() - rng.int(0, daysAgo) * 86_400_000).toISOString(),
      resolved_by: status === "resolved" ? "Admin User" : null,
    };
  });
}

const cache: Record<string, RawReport[]> = {};

function getReports(tenantId: string): RawReport[] {
  if (!cache[tenantId]) cache[tenantId] = buildReports(tenantId);
  return cache[tenantId];
}

export function list(tenantId: string | null, params: Params): RawPaginatedReports {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getReports(tenantId);
  const status = params.status;
  const reason = params.reason;
  const search = (params.search ?? "").trim().toLowerCase();
  const page = Number(params.page ?? "0") || 0;
  const pageSize = Number(params.page_size ?? "20") || 20;

  const filtered = items.filter((item) => {
    if (status && status !== "all" && item.status !== status) return false;
    if (reason && reason !== "all" && item.reason !== reason) return false;
    if (search && !item.target_name.toLowerCase().includes(search) && !item.reporter_name.toLowerCase().includes(search)) return false;
    return true;
  });

  const start = page * pageSize;
  return { items: filtered.slice(start, start + pageSize), total: filtered.length, page, page_size: pageSize };
}

export function resolve(tenantId: string | null, id: string): RawReport {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getReports(tenantId);
  const item = items.find((r) => r.id === id);
  if (!item) throw new AppError("not_found", "Report not found", 404);
  item.status = "resolved";
  item.resolved_by = "Current User";
  item.updated_at = new Date().toISOString();
  return item;
}

export function dismiss(tenantId: string | null, id: string): RawReport {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getReports(tenantId);
  const item = items.find((r) => r.id === id);
  if (!item) throw new AppError("not_found", "Report not found", 404);
  item.status = "dismissed";
  item.updated_at = new Date().toISOString();
  return item;
}

export function investigate(tenantId: string | null, id: string): RawReport {
  if (!tenantId) throw new AppError("validation", "Missing tenant scope", 422);
  const items = getReports(tenantId);
  const item = items.find((r) => r.id === id);
  if (!item) throw new AppError("not_found", "Report not found", 404);
  item.status = "investigating";
  item.updated_at = new Date().toISOString();
  return item;
}
