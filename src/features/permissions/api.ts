import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { roleSchema, rolesResponseSchema } from "./schemas";
import { roleFromRaw, rolesFromRaw } from "./adaptors";
import { buildPermissionMatrix } from "./matrix";
import type { Role, RoleWriteBody } from "./types";

export async function listRoles(): Promise<Role[]> {
  const { data } = await httpClient.get("/v1/roles");
  return validateAndAdapt(data, rolesResponseSchema, rolesFromRaw);
}

function toRequestBody(body: RoleWriteBody) {
  return {
    label: body.label,
    color: body.color,
    permissions: buildPermissionMatrix(body.permissions),
  };
}

export async function createRole(body: RoleWriteBody): Promise<Role> {
  const { data } = await httpClient.post("/v1/roles", toRequestBody(body));
  return validateAndAdapt(data, roleSchema, roleFromRaw);
}

export async function updateRole(id: string, body: RoleWriteBody): Promise<Role> {
  const { data } = await httpClient.put(`/v1/roles/${id}`, toRequestBody(body));
  return validateAndAdapt(data, roleSchema, roleFromRaw);
}

export async function deleteRole(id: string): Promise<void> {
  await httpClient.delete(`/v1/roles/${id}`);
}
