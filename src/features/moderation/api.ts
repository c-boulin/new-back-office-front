import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { moderationStatsSchema, paginatedModerationSchema } from "./schemas";
import { moderationStatsFromRaw, paginatedModerationFromRaw } from "./adaptors";
import type { ModerationQuery, ModerationStats, PaginatedModeration } from "./types";

export async function listModeration(query: ModerationQuery): Promise<PaginatedModeration> {
  const { data } = await httpClient.get("/moderation", {
    params: {
      status: query.status && query.status !== "all" ? query.status : undefined,
      type: query.type && query.type !== "all" ? query.type : undefined,
      kind: query.kind && query.kind !== "all" ? query.kind : undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, paginatedModerationSchema, paginatedModerationFromRaw);
}

export async function fetchModerationStats(): Promise<ModerationStats> {
  const { data } = await httpClient.get("/moderation/stats");
  return validateAndAdapt(data, moderationStatsSchema, moderationStatsFromRaw);
}

export async function approveItem(id: string): Promise<void> {
  await httpClient.post(`/moderation/${id}/approve`);
}

export async function rejectItem(id: string, reason: string): Promise<void> {
  await httpClient.post(`/moderation/${id}/reject`, { reason });
}

export async function escalateItem(id: string): Promise<void> {
  await httpClient.post(`/moderation/${id}/escalate`);
}
