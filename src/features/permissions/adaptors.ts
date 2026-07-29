import { sanitizeText } from "@/lib/sanitize";
import { buildPermissionMatrix } from "./matrix";
import type { Role } from "./types";
import type { RawRole, RawRolesResponse } from "./schemas";

export function roleFromRaw(raw: RawRole): Role {
  return {
    id: raw.id,
    label: sanitizeText(raw.label),
    color: raw.color,
    isLocked: raw.isLocked,
    permissions: buildPermissionMatrix(raw.permissions),
    createdAt: raw.createdAt,
  };
}

export function rolesFromRaw(raw: RawRolesResponse): Role[] {
  return raw.data.map(roleFromRaw);
}
