import type { PermissionSection, PermissionAction } from "@/lib/permissions";
import { PERMISSION_MATRIX } from "@/lib/permissions";

export type PermissionGroupKey = "main" | "animation" | "analysis" | "moderation" | "configuration";

export const PERMISSION_GROUPS: Array<{
  key: PermissionGroupKey;
  sections: PermissionSection[];
}> = [
  { key: "main", sections: ["dashboard", "users"] },
  { key: "animation", sections: ["animators", "coachs", "coach-ia"] },
  { key: "analysis", sections: ["statistics"] },
  { key: "moderation", sections: ["moderation", "signalement"] },
  { key: "configuration", sections: ["product-config", "settings"] },
];

export function actionsForSection(section: PermissionSection): PermissionAction[] {
  return PERMISSION_MATRIX[section];
}
