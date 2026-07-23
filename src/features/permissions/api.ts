import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { roleResponseSchema, rolesResponseSchema, type RawRoleColor } from "./schemas";
import {
  matrixToRawPermissions,
  roleResponseToRole,
  rolesResponseToList,
  type Role,
} from "./adaptors";
import type { PermissionMatrix } from "@/lib/permissions";

export type RolePayload = {
  label: string;
  color: RawRoleColor;
  matrix: PermissionMatrix;
};

function toBody(payload: RolePayload) {
  return {
    label: payload.label,
    color: payload.color,
    permissions: matrixToRawPermissions(payload.matrix),
  };
}

export async function fetchRoles(): Promise<Role[]> {
  const { data } = await httpClient.get("/v1/roles");
  return validateAndAdapt(data, rolesResponseSchema, rolesResponseToList);
}

export async function createRole(payload: RolePayload): Promise<Role> {
  const { data } = await httpClient.post("/v1/roles", toBody(payload));
  return validateAndAdapt(data, roleResponseSchema, roleResponseToRole);
}

export async function updateRole(id: string, payload: RolePayload): Promise<Role> {
  const { data } = await httpClient.put(`/v1/roles/${id}`, toBody(payload));
  return validateAndAdapt(data, roleResponseSchema, roleResponseToRole);
}

export async function deleteRole(id: string): Promise<void> {
  await httpClient.delete(`/v1/roles/${id}`);
}
