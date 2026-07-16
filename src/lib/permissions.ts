export const PERMISSIONS = {
  SUPER_ADMIN: "super_admin",
  TENANT_ADMIN: "tenant.admin",
  USERS_READ: "users.read",
  USERS_WRITE: "users.write",
  USERS_MODERATE: "users.moderate",
  MODERATION_READ: "moderation.read",
  MODERATION_ACT: "moderation.act",
  REPORTS_READ: "reports.read",
  REPORTS_RESOLVE: "reports.resolve",
  MATCHES_READ: "matches.read",
  MESSAGES_READ: "messages.read",
  MESSAGES_FLAG: "messages.flag",
  ANALYTICS_READ: "analytics.read",
  SUBSCRIPTIONS_READ: "subscriptions.read",
  SUBSCRIPTIONS_WRITE: "subscriptions.write",
  SUBSCRIPTIONS_REFUND: "subscriptions.refund",
  SETTINGS_READ: "settings.read",
  SETTINGS_WRITE: "settings.write",
  FLAGS_READ: "flags.read",
  FLAGS_WRITE: "flags.write",
  AUDIT_READ: "audit.read",
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
