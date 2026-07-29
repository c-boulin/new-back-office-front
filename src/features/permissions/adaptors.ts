import { sanitizeText } from "@/lib/sanitize";
import { buildPermissionMatrix } from "./matrix";
import { roleColorSchema } from "./schemas";
import type { PermissionMatrix, Role, RoleColor } from "./types";
import type { RawRole, RawRolesResponse } from "./schemas";

function toRoleColor(value: unknown): RoleColor {
  const parsed = roleColorSchema.safeParse(value);
  return parsed.success ? parsed.data : "secondary";
}

function normalizePermissions(value: unknown): PermissionMatrix {
  const source: PermissionMatrix = {};
  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [section, actions] of Object.entries(value as Record<string, unknown>)) {
      if (actions && typeof actions === "object" && !Array.isArray(actions)) {
        source[section] = {};
        for (const [action, enabled] of Object.entries(actions as Record<string, unknown>)) {
          source[section][action] = enabled === true;
        }
      }
    }
  }
  return source;
}

export function roleFromRaw(raw: RawRole): Role {
  return {
    id: String(raw.id),
    label: sanitizeText(raw.label ?? ""),
    color: toRoleColor(raw.color),
    isLocked: raw.isLocked ?? false,
    permissions: buildPermissionMatrix(normalizePermissions(raw.permissions)),
    createdAt: raw.createdAt ?? null,
  };
}

export function rolesFromRaw(raw: RawRolesResponse): Role[] {
  const items = Array.isArray(raw) ? raw : raw.data;
  return items.map(roleFromRaw);
}