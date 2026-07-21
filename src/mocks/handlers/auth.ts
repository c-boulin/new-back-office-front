import { AppError } from "@/lib/httpClient";
import { db } from "../db";
import type { RawApiUser, RawLoginResponse } from "@/features/tenants/schemas";

function fakeToken(subject: string) {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ sub: subject, iat: Math.floor(Date.now() / 1000) }),
  );
  const signature = btoa(`sig-${subject}-${crypto.randomUUID()}`);
  return `${header}.${payload}.${signature}`;
}

function sessionFor(user: RawApiUser): RawLoginResponse {
  return {
    access_token: fakeToken(user.email),
    refresh_token: fakeToken(`${user.email}-refresh`),
    user,
  };
}

export function login(body: { email?: unknown; password?: unknown }): RawLoginResponse {
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const account = db.findAccount(email, password);
  if (!account) throw new AppError("unauthorized", "Invalid credentials", 401);
  return sessionFor(account.user);
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

export function refresh(body: { refresh_token?: unknown }): { access_token: string } {
  const token = typeof body.refresh_token === "string" ? body.refresh_token : "";
  const subject = subjectFromToken(token)?.replace(/-refresh$/, "");
  if (!subject) throw new AppError("unauthorized", "Refresh token invalid", 401);
  return { access_token: fakeToken(subject) };
}

export function logout(): { ok: true } {
  return { ok: true };
}

export function me(authorization: string | null): { user: RawApiUser } {
  const subject = subjectFromToken(authorization);
  const account = subject ? db.findAccount(subject) : null;
  if (!account) throw new AppError("unauthorized", "Not signed in", 401);
  return { user: account.user };
}

export function ssoInit(): { data: { url: string } } {
  throw new AppError(
    "not_found",
    "SSO cannot be mocked — configure a real backend to exercise Sesame.",
    501,
  );
}

export function ssoLogin(): RawLoginResponse {
  throw new AppError(
    "not_found",
    "SSO cannot be mocked — configure a real backend to exercise Sesame.",
    501,
  );
}
