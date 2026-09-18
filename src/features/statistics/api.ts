import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import {
  usersStatsSchema,
  engagementStatsSchema,
  moderationStatsSchema,
  retentionStatsSchema,
} from "./schemas";
import {
  usersStatsFromRaw,
  engagementStatsFromRaw,
  moderationStatsFromRaw,
  retentionStatsFromRaw,
} from "./adaptors";
import type { UsersStats, EngagementStats, ModerationStats, RetentionStats, StatsDateParams } from "./types";

function dateParams(p?: StatsDateParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (p?.from) out.from = p.from;
  if (p?.to) out.to = p.to;
  if (p?.compare) out.compare = p.compare;
  return out;
}

export async function getUsersStats(params?: StatsDateParams): Promise<UsersStats> {
  const { data } = await httpClient.get("/v1/stats/users", { params: dateParams(params) });
  return validateAndAdapt(data.data, usersStatsSchema, usersStatsFromRaw);
}

export async function getEngagementStats(params?: StatsDateParams): Promise<EngagementStats> {
  const { data } = await httpClient.get("/v1/stats/engagement", { params: dateParams(params) });
  return validateAndAdapt(data.data, engagementStatsSchema, engagementStatsFromRaw);
}

export async function getModerationStats(params?: StatsDateParams): Promise<ModerationStats> {
  const { data } = await httpClient.get("/v1/stats/moderation", { params: dateParams(params) });
  return validateAndAdapt(data.data, moderationStatsSchema, moderationStatsFromRaw);
}

export async function getRetentionStats(params?: StatsDateParams): Promise<RetentionStats> {
  const { data } = await httpClient.get("/v1/stats/retention", { params: dateParams(params) });
  return validateAndAdapt(data.data, retentionStatsSchema, retentionStatsFromRaw);
}
