export const ROLE_COLORS = [
  "error",
  "warning",
  "info",
  "success",
  "primary",
  "secondary",
] as const;

export type RoleColor = (typeof ROLE_COLORS)[number];

export const ROLE_ACTIONS = ["create", "read", "update", "delete"] as const;

export type RoleAction = (typeof ROLE_ACTIONS)[number];

// Fixed catalog defined by the backend. Keys are the API section/action ids and
// must not be translated when sent to the server.
export const BACKOFFICE_SECTIONS = {
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
} as const;

export type SectionId = keyof typeof BACKOFFICE_SECTIONS;

export type PermissionMatrix = Record<string, Record<string, boolean>>;

export type Role = {
  id: string;
  label: string;
  color: RoleColor;
  isLocked: boolean;
  permissions: PermissionMatrix;
  createdAt: string | null;
};

export type RoleWriteBody = {
  label: string;
  color: RoleColor;
  permissions: PermissionMatrix;
};
