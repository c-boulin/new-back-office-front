import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { paginatedMessageThreadsSchema } from "./schemas";
import { paginatedMessageThreadsFromRaw } from "./adaptors";
import type { MessageThreadsQuery, PaginatedMessageThreads } from "./types";

export async function listMessageThreads(
  query: MessageThreadsQuery,
): Promise<PaginatedMessageThreads> {
  const { data } = await httpClient.get("/messages/threads", {
    params: {
      flagged: query.flagged ? "true" : undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(
    data,
    paginatedMessageThreadsSchema,
    paginatedMessageThreadsFromRaw,
  );
}
