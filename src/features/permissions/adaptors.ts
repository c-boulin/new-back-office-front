import type { PermissionMatrix, PermissionAction } from "@/lib/permissions";
import { PERMISSION_MATRIX, PERMISSION_SECTIONS } from "@/lib/permissions";
import type { RawRoleColor, RawRoleMatrix } from "./schemas";

export const ROLE_COLORS: RawRoleColor[] = [
  "error",
  "warning",
  "info",
  "success",
  "primary",
  "secondary",
];

export type Role = {
  id: string;
  label: string;
  color: RawRoleColor | null;
  isLocked: boolean;
  matrix: PermissionMatrix;
  grantedCount: number;
  createdAt: string | null;
};

function toMatrix(raw: RawRoleMatrix): PermissionMatrix {
  const out: PermissionMatrix = {};
  for (const section of PERMISSION_SECTIONS) {
    const rawSection = raw[section];
    if (!rawSection) continue;
    const actions: Partial<Record<PermissionAction, boolean>> = {};
    for (const action of PERMISSION_MATRIX[section]) {
      if (typeof rawSection[action] === "boolean") {
        actions[action] = rawSection[action];
      }
    }
    out[section] = actions;
  }
  return out;
}

function countGranted(matrix: PermissionMatrix): number {
  let total = 0;
  for (const section of PERMISSION_SECTIONS) {
    const actions = matrix[section];
    if (!actions) continue;
    for (const action of PERMISSION_MATRIX[section]) {
      if (actions[action]) total += 1;
    }
  }
  return total;
}

export function rawRoleToRole(raw: {
  id: string;
  label: string;
  color: RawRoleColor | null;
  isLocked: boolean;
  permissions: RawRoleMatrix;
  createdAt: string | null;
}): Role {
  const matrix = toMatrix(raw.permissions);
  return {
    id: raw.id,
    label: raw.label,
    color: raw.color,
    isLocked: raw.isLocked,
    matrix,
    grantedCount: countGranted(matrix),
    createdAt: raw.createdAt,
  };
}

export function rolesResponseToList(raw: {
  data: Array<{
    id: string;
    label: string;
    color: RawRoleColor | null;
    isLocked: boolean;
    permissions: RawRoleMatrix;
    createdAt: string | null;
  }>;
}): Role[] {
  return raw.data.map(rawRoleToRole);
}

export function roleResponseToRole(raw: {
  data: {
    id: string;
    label: string;
    color: RawRoleColor | null;
    isLocked: boolean;
    permissions: RawRoleMatrix;
    createdAt: string | null;
  };
}): Role {
  return rawRoleToRole(raw.data);
}

export function matrixToRawPermissions(matrix: PermissionMatrix): RawRoleMatrix {
  const out: RawRoleMatrix = {};
  for (const section of PERMISSION_SECTIONS) {
    const actions = matrix[section];
    if (!actions) continue;
    const bucket: Record<string, boolean> = {};
    for (const action of PERMISSION_MATRIX[section]) {
      bucket[action] = Boolean(actions[action]);
    }
    out[section] = bucket;
  }
  return out;
}
