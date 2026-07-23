export type PermissionSection =
  | "dashboard"
  | "users"
  | "animators"
  | "coachs"
  | "coach-ia"
  | "statistics"
  | "moderation"
  | "signalement"
  | "product-config"
  | "settings";

export type PermissionAction = "create" | "read" | "update" | "delete";

export const PERMISSION_MATRIX: Record<PermissionSection, PermissionAction[]> = {
  dashboard: ["read"],
  users: ["read", "update", "delete"],
  animators: ["create", "read", "update", "delete"],
  coachs: ["create", "read", "update", "delete"],
  "coach-ia": ["read", "update"],
  statistics: ["read"],
  moderation: ["read", "update"],
  signalement: ["read", "update"],
  "product-config": ["create", "read", "update", "delete"],
  settings: ["create", "read", "update", "delete"],
};

export const PERMISSION_SECTIONS = Object.keys(PERMISSION_MATRIX) as PermissionSection[];

export const PERMISSION_CATALOG: readonly string[] = PERMISSION_SECTIONS.flatMap((section) =>
  PERMISSION_MATRIX[section].map((action) => `${section}.${action}`),
);

export type Permission = string;

export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard.read",
  USERS_READ: "users.read",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  ANIMATORS_CREATE: "animators.create",
  ANIMATORS_READ: "animators.read",
  ANIMATORS_UPDATE: "animators.update",
  ANIMATORS_DELETE: "animators.delete",
  COACHS_CREATE: "coachs.create",
  COACHS_READ: "coachs.read",
  COACHS_UPDATE: "coachs.update",
  COACHS_DELETE: "coachs.delete",
  COACH_IA_READ: "coach-ia.read",
  COACH_IA_UPDATE: "coach-ia.update",
  STATISTICS_READ: "statistics.read",
  MODERATION_READ: "moderation.read",
  MODERATION_UPDATE: "moderation.update",
  SIGNALEMENT_READ: "signalement.read",
  SIGNALEMENT_UPDATE: "signalement.update",
  PRODUCT_CONFIG_CREATE: "product-config.create",
  PRODUCT_CONFIG_READ: "product-config.read",
  PRODUCT_CONFIG_UPDATE: "product-config.update",
  PRODUCT_CONFIG_DELETE: "product-config.delete",
  SETTINGS_CREATE: "settings.create",
  SETTINGS_READ: "settings.read",
  SETTINGS_UPDATE: "settings.update",
  SETTINGS_DELETE: "settings.delete",
} as const;

export type PermissionMatrix = Partial<
  Record<PermissionSection, Partial<Record<PermissionAction, boolean>>>
>;

export function hasPermission(
  granted: readonly string[] | undefined,
  required: Permission | Permission[],
): boolean {
  if (!granted?.length) return false;
  const list = Array.isArray(required) ? required : [required];
  return list.every((p) => granted.includes(p));
}

export function slugsFromMatrix(matrix: PermissionMatrix): string[] {
  const slugs: string[] = [];
  for (const section of PERMISSION_SECTIONS) {
    const actions = matrix[section];
    if (!actions) continue;
    for (const action of PERMISSION_MATRIX[section]) {
      if (actions[action]) slugs.push(`${section}.${action}`);
    }
  }
  return slugs;
}

export function countMatrixGrants(matrix: PermissionMatrix): number {
  return slugsFromMatrix(matrix).length;
}

export const PERMISSION_TOTAL = PERMISSION_CATALOG.length;
