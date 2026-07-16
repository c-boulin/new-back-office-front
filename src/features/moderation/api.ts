import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawPaginatedModerationSchema } from "./schemas";
import { paginatedModerationFromRaw } from "./adaptors";
import type { PaginatedModeration, ModerationQuery } from "./types";

export async function listModerationItems(query: ModerationQuery): Promise<PaginatedModeration> {
  const { data } = await httpClient.get("/moderation", {
    params: {
      type: query.type && query.type !== "all" ? query.type : undefined,
      status: query.status && query.status !== "all" ? query.status : undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, rawPaginatedModerationSchema, paginatedModerationFromRaw);
}

export async function approveModerationItem(id: string): Promise<void> {
  await httpClient.post(`/moderation/${id}/approve`);
}

export async function rejectModerationItem(id: string): Promise<void> {
  await httpClient.post(`/moderation/${id}/reject`);
}

export async function escalateModerationItem(id: string): Promise<void> {
  await httpClient.post(`/moderation/${id}/escalate`);
}
