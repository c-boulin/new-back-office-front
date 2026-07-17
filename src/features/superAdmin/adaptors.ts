import type { PlatformAdmin } from "./types";
import type { RawPlatformAdmin, RawPlatformAdminList } from "./schemas";

export function platformAdminFromRaw(raw: RawPlatformAdmin): PlatformAdmin {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    lastActiveAt: raw.last_active_at,
    createdAt: raw.created_at,
  };
}

export function platformAdminListFromRaw(raw: RawPlatformAdminList): PlatformAdmin[] {
  return raw.items.map(platformAdminFromRaw);
}
