import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawPaginatedAuditSchema } from "./schemas";
import { paginatedAuditFromRaw } from "./adaptors";
import type { PaginatedAuditEvents, AuditQuery } from "./types";

export async function listAuditEvents(query: AuditQuery): Promise<PaginatedAuditEvents> {
  const { data } = await httpClient.get("/audit", {
    params: {
      action: query.action && query.action !== "all" ? query.action : undefined,
      actor_id: query.actorId || undefined,
      search: query.search || undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, rawPaginatedAuditSchema, paginatedAuditFromRaw);
}
