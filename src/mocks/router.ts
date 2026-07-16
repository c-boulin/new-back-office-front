import { AppError } from "@/lib/httpClient";
import * as auth from "./handlers/auth";
import * as users from "./handlers/users";
import * as tenants from "./handlers/tenants";

export type MockRequest = {
  method: string;
  url: string;
  params: Record<string, string | undefined>;
  body: unknown;
  headers: Record<string, string | null>;
};

export type MockResponse = {
  status: number;
  data: unknown;
};

function match(pattern: string, url: string): Record<string, string> | null {
  const patternParts = pattern.split("/").filter(Boolean);
  const urlParts = url.split("?")[0].split("/").filter(Boolean);
  if (patternParts.length !== urlParts.length) return null;
  const captured: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const p = patternParts[i];
    const u = urlParts[i];
    if (p.startsWith(":")) captured[p.slice(1)] = decodeURIComponent(u);
    else if (p !== u) return null;
  }
  return captured;
}

type Route = (req: MockRequest, params: Record<string, string>) => MockResponse | Promise<MockResponse>;

function ok(data: unknown, status = 200): MockResponse {
  return { status, data };
}

const routes: Array<{ method: string; pattern: string; handler: Route }> = [
  { method: "POST", pattern: "/auth/login", handler: (r) => ok(auth.login((r.body ?? {}) as never)) },
  { method: "POST", pattern: "/auth/refresh", handler: (r) => ok(auth.refresh((r.body ?? {}) as never)) },
  { method: "POST", pattern: "/auth/logout", handler: () => ok(auth.logout()) },
  { method: "GET", pattern: "/auth/me", handler: (r) => ok(auth.me(r.headers.authorization ?? null)) },

  { method: "GET", pattern: "/admin/tenants", handler: () => ok(tenants.list()) },
  { method: "GET", pattern: "/admin/tenants/:id", handler: (_, p) => ok(tenants.byId(p.id)) },

  { method: "GET", pattern: "/users", handler: (r) => ok(users.list(r.headers["x-tenant-id"], r.params)) },
  { method: "POST", pattern: "/users/:id/ban", handler: (r, p) => ok(users.ban(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/users/:id/unban", handler: (r, p) => ok(users.unban(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/users/:id/verify", handler: (r, p) => ok(users.verify(r.headers["x-tenant-id"], p.id)) },
];

export async function mockRouter(req: MockRequest): Promise<MockResponse> {
  const method = req.method.toUpperCase();
  for (const route of routes) {
    if (route.method !== method) continue;
    const params = match(route.pattern, req.url);
    if (!params) continue;
    return route.handler(req, params);
  }
  throw new AppError("not_found", `No mock handler for ${method} ${req.url}`, 404);
}
