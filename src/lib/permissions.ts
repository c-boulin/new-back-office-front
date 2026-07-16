export const PERMISSIONS = {
  SUPER_ADMIN: "super_admin",
  TENANT_ADMIN: "tenant.admin",
  USERS_READ: "users.read",
  USERS_WRITE: "users.write",
  USERS_MODERATE: "users.moderate",
  MODERATION_READ: "moderation.read",
  MODERATION_ACT: "moderation.act",
  ANALYTICS_READ: "analytics.read",
  SUBSCRIPTIONS_READ: "subscriptions.read",
  SUBSCRIPTIONS_WRITE: "subscriptions.write",
  SETTINGS_WRITE: "settings.write",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export function hasPermission(
  granted: readonly string[] | undefined,
  required: Permission | Permission[],
): boolean {
  if (!granted?.length) return false;
  if (granted.includes(PERMISSIONS.SUPER_ADMIN)) return true;
  const list = Array.isArray(required) ? required : [required];
  return list.every((p) => granted.includes(p));
}
