import { sanitizeText } from "@/lib/sanitize";
import { buildPermissionMatrix } from "./matrix";
import { LEGACY_COLOR_MAP, DEFAULT_ROLE_COLOR } from "./types";
import type { PermissionMatrix, Role } from "./types";
import type { RawRole, RawRolesResponse } from "./schemas";

const HEX_RE = /^#[\da-f]{6}$/i;

function toHexColor(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_ROLE_COLOR;
  if (HEX_RE.test(value)) return value;
  return LEGACY_COLOR_MAP[value] ?? DEFAULT_ROLE_COLOR;
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
    color: toHexColor(raw.color),
    isLocked: raw.isLocked ?? false,
    permissions: buildPermissionMatrix(normalizePermissions(raw.permissions)),
    createdAt: raw.createdAt ?? null,
  };
}

export function rolesFromRaw(raw: RawRolesResponse): Role[] {
  const items = Array.isArray(raw) ? raw : raw.data;
  return items.map(roleFromRaw);
}
