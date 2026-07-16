import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { rawPaginatedMatchesSchema } from "./schemas";
import { paginatedMatchesFromRaw } from "./adaptors";
import type { PaginatedMatches, MatchesQuery } from "./types";

export async function listMatches(query: MatchesQuery): Promise<PaginatedMatches> {
  const { data } = await httpClient.get("/matches", {
    params: {
      search: query.search || undefined,
      active: query.active !== "all" ? query.active : undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, rawPaginatedMatchesSchema, paginatedMatchesFromRaw);
}
