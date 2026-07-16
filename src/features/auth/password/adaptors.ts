import { authUserFromRaw, membershipFromRaw } from "../adaptors";
import type { RawPasswordSession } from "./schemas";
import type { PasswordSession } from "./types";

export function passwordSessionFromRaw(raw: RawPasswordSession): PasswordSession {
  return {
    accessToken: raw.access_token,
    refreshToken: raw.refresh_token,
    expiresAt: raw.expires_at,
    user: authUserFromRaw(raw.user),
    memberships: raw.memberships.map(membershipFromRaw),
  };
}
