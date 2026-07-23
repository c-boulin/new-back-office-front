import { AppError } from "@/lib/httpClient";
import * as auth from "./handlers/auth";
import * as users from "./handlers/users";
import * as tenants from "./handlers/tenants";
import * as products from "./handlers/products";
import * as moderation from "./handlers/moderation";
import * as reports from "./handlers/reports";
import * as messages from "./handlers/messages";
import * as tenantData from "./handlers/tenantData";

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

function readReason(body: unknown): string {
  if (typeof body === "object" && body && "reason" in body) {
    const value = (body as { reason?: unknown }).reason;
    if (typeof value === "string") return value;
  }
  return "";
}

function tenantHeader(req: MockRequest): string | null {
  const raw = req.params.product_id;
  if (raw) return raw;
  return null;
}

const routes: Array<{ method: string; pattern: string; handler: Route }> = [
  { method: "POST", pattern: "/v1/auth/login", handler: (r) => ok(auth.login((r.body ?? {}) as never)) },
  { method: "POST", pattern: "/v1/auth/refresh", handler: (r) => ok(auth.refresh((r.body ?? {}) as never)) },
  { method: "POST", pattern: "/v1/auth/logout", handler: () => ok(auth.logout()) },
  { method: "GET", pattern: "/v1/auth/me", handler: (r) => ok(auth.me(r.headers.authorization ?? null)) },
  { method: "GET", pattern: "/v1/auth/sso/init", handler: () => ok(auth.ssoInit()) },
  { method: "POST", pattern: "/v1/auth/sso/login", handler: () => ok(auth.ssoLogin()) },

  { method: "GET", pattern: "/v1/products", handler: () => ok(products.list()) },

  { method: "GET", pattern: "/admin/tenants", handler: () => ok(tenants.list()) },
  { method: "GET", pattern: "/admin/tenants/:id", handler: (_, p) => ok(tenants.byId(p.id)) },
  { method: "GET", pattern: "/admin/admins", handler: () => ok(tenantData.platformAdmins()) },

  { method: "GET", pattern: "/users", handler: (r) => ok(users.list(tenantHeader(r), r.params)) },
  { method: "POST", pattern: "/users/:id/ban", handler: (r, p) => ok(users.ban(tenantHeader(r), p.id)) },
  { method: "POST", pattern: "/users/:id/unban", handler: (r, p) => ok(users.unban(tenantHeader(r), p.id)) },
  { method: "POST", pattern: "/users/:id/verify", handler: (r, p) => ok(users.verify(tenantHeader(r), p.id)) },

  { method: "GET", pattern: "/dashboard", handler: (r) => ok(tenantData.dashboard(tenantHeader(r))) },
  { method: "GET", pattern: "/matches/overview", handler: (r) => ok(tenantData.matches(tenantHeader(r))) },
  { method: "GET", pattern: "/subscriptions/overview", handler: (r) => ok(tenantData.subscriptions(tenantHeader(r))) },
  { method: "GET", pattern: "/analytics/overview", handler: (r) => ok(tenantData.analytics(tenantHeader(r))) },
  { method: "GET", pattern: "/settings", handler: (r) => ok(tenantData.settings(tenantHeader(r))) },
  { method: "PATCH", pattern: "/settings", handler: (r) => ok(tenantData.updateSettings(tenantHeader(r), r.body)) },

  { method: "GET", pattern: "/moderation", handler: (r) => ok(moderation.list(tenantHeader(r), r.params)) },
  { method: "GET", pattern: "/moderation/stats", handler: (r) => ok(moderation.stats(tenantHeader(r))) },
  { method: "POST", pattern: "/moderation/:id/approve", handler: (r, p) => ok(moderation.approve(tenantHeader(r), p.id)) },
  { method: "POST", pattern: "/moderation/:id/reject", handler: (r, p) => ok(moderation.reject(tenantHeader(r), p.id, readReason(r.body))) },
  { method: "POST", pattern: "/moderation/:id/escalate", handler: (r, p) => ok(moderation.escalate(tenantHeader(r), p.id)) },

  { method: "GET", pattern: "/reports", handler: (r) => ok(reports.list(tenantHeader(r), r.params)) },
  { method: "POST", pattern: "/reports/:id/resolve", handler: (r, p) => ok(reports.resolve(tenantHeader(r), p.id)) },
  { method: "POST", pattern: "/reports/:id/dismiss", handler: (r, p) => ok(reports.dismiss(tenantHeader(r), p.id, readReason(r.body))) },

  { method: "GET", pattern: "/messages/threads", handler: (r) => ok(messages.listThreads(tenantHeader(r), r.params)) },
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
