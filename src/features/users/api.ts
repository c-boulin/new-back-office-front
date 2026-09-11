import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { paginatedUsersSchema } from "./schemas";
import { paginatedUsersFromRaw } from "./adaptors";
import type { PaginatedUsers, UsersQuery } from "./types";

export async function listUsers(query: UsersQuery): Promise<PaginatedUsers> {
  const { data } = await httpClient.get("/users", {
    params: {
      search: query.search || undefined,
      status: query.status && query.status !== "all" ? query.status : undefined,
      page: query.page,
      page_size: query.pageSize,
    },
  });
  return validateAndAdapt(data, paginatedUsersSchema, paginatedUsersFromRaw);
}

export async function banUser(id: string, reason: string): Promise<void> {
  await httpClient.post(`/users/${id}/ban`, { reason });
}

export async function unbanUser(id: string): Promise<void> {
  await httpClient.post(`/users/${id}/unban`);
}

export async function verifyUser(id: string): Promise<void> {
  await httpClient.post(`/users/${id}/verify`);
}
