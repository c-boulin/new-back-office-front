import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { paginatedBoUsersSchema } from "./schemas";
import { paginatedBoUsersFromRaw } from "./adaptors";
import type { BoUserWriteBody, PaginatedBoUsers } from "./types";

export type BoUsersQuery = {
  page: number;
  perPage: number;
};

export async function listBoUsers(query: BoUsersQuery): Promise<PaginatedBoUsers> {
  const { data } = await httpClient.get("/v1/bo-users", {
    params: { page: query.page, per_page: query.perPage },
  });
  return validateAndAdapt(data, paginatedBoUsersSchema, paginatedBoUsersFromRaw);
}

function toRequestBody(body: BoUserWriteBody) {
  return {
    name: body.name,
    email: body.email,
    products: body.products.map((assignment) => ({
      id: assignment.id,
      roleId: assignment.roleId,
    })),
  };
}

export async function createBoUser(body: BoUserWriteBody): Promise<void> {
  await httpClient.post("/v1/bo-users", toRequestBody(body));
}

export async function updateBoUser(id: number, body: BoUserWriteBody): Promise<void> {
  await httpClient.put(`/v1/bo-users/${id}`, toRequestBody(body));
}

export async function deleteBoUser(id: number): Promise<void> {
  await httpClient.delete(`/v1/bo-users/${id}`);
}
