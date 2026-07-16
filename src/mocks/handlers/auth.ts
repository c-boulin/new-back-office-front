import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawPasswordSession } from "@/features/auth/password/schemas";

const HOUR = 60 * 60;

function fakeToken(subject: string) {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ sub: subject, iat: Math.floor(Date.now() / 1000) }),
  );
  const signature = btoa(`sig-${subject}-${crypto.randomUUID()}`);
  return `${header}.${payload}.${signature}`;
}

function expiresAt(seconds = HOUR) {
  return Math.floor(Date.now() / 1000) + seconds;
}

function sessionFor(identifier: string): RawPasswordSession {
  const account = db.findAccount(identifier);
  if (!account) throw new AppError("unauthorized", "Session expired", 401);
  return {
    access_token: fakeToken(account.identifier),
    refresh_token: fakeToken(`${account.identifier}-refresh`),
    expires_at: expiresAt(),
    user: account.user,
    memberships: account.memberships,
  };
}

export function login(body: { identifier?: unknown; password?: unknown }): RawPasswordSession {
  const identifier = typeof body.identifier === "string" ? body.identifier : "";
  const password = typeof body.password === "string" ? body.password : "";
  const account = db.findAccount(identifier, password);
  if (!account) throw new AppError("unauthorized", "Invalid credentials", 401);
  return sessionFor(account.identifier);
}

function subjectFromToken(token: string | null): string | null {
  if (!token) return null;
  const stripped = token.replace(/^Bearer\s+/i, "");
  const parts = stripped.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(atob(parts[1])) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export function refresh(body: { refresh_token?: unknown }): RawPasswordSession {
  const token = typeof body.refresh_token === "string" ? body.refresh_token : "";
  const subject = subjectFromToken(token)?.replace(/-refresh$/, "") ?? "admin";
  return sessionFor(subject);
}

export function logout(): { ok: true } {
  return { ok: true };
}

export function me(authorization: string | null): { user: unknown; memberships: unknown } {
  const subject = subjectFromToken(authorization) ?? "admin";
  const account = db.findAccount(subject);
  if (!account) throw new AppError("unauthorized", "Not signed in", 401);
  return { user: account.user, memberships: account.memberships };
}
