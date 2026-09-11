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
  color: string;
  isLocked: boolean;
  permissions: PermissionMatrix;
  createdAt: string | null;
};

export type RoleWriteBody = {
  label: string;
  color: string;
  permissions: PermissionMatrix;
};

export const LEGACY_COLOR_MAP: Record<string, string> = {
  error: "#ef4444",
  warning: "#f97316",
  info: "#3b82f6",
  success: "#10b981",
  primary: "#6366f1",
  secondary: "#6b7280",
};

export const DEFAULT_ROLE_COLOR = "#3b82f6";
