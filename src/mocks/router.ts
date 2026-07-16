import { AppError } from "@/lib/httpClient";
import * as auth from "./handlers/auth";
import * as users from "./handlers/users";
import * as tenants from "./handlers/tenants";
import * as moderation from "./handlers/moderation";
import * as dashboard from "./handlers/dashboard";
import * as reports from "./handlers/reports";
import * as matches from "./handlers/matches";
import * as messages from "./handlers/messages";
import * as subscriptions from "./handlers/subscriptions";
import * as analytics from "./handlers/analytics";
import * as settings from "./handlers/settings";
import * as audit from "./handlers/audit";

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
  // Auth
  { method: "POST", pattern: "/auth/login", handler: (r) => ok(auth.login((r.body ?? {}) as never)) },
  { method: "POST", pattern: "/auth/refresh", handler: (r) => ok(auth.refresh((r.body ?? {}) as never)) },
  { method: "POST", pattern: "/auth/logout", handler: () => ok(auth.logout()) },
  { method: "GET", pattern: "/auth/me", handler: (r) => ok(auth.me(r.headers.authorization ?? null)) },

  // Admin — tenants
  { method: "GET", pattern: "/admin/tenants", handler: () => ok(tenants.list()) },
  { method: "GET", pattern: "/admin/tenants/:id", handler: (_, p) => ok(tenants.byId(p.id)) },

  // Users
  { method: "GET", pattern: "/users", handler: (r) => ok(users.list(r.headers["x-tenant-id"], r.params)) },
  { method: "POST", pattern: "/users/:id/ban", handler: (r, p) => ok(users.ban(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/users/:id/unban", handler: (r, p) => ok(users.unban(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/users/:id/verify", handler: (r, p) => ok(users.verify(r.headers["x-tenant-id"], p.id)) },

  // Dashboard
  { method: "GET", pattern: "/dashboard/overview", handler: (r) => ok(dashboard.overview(r.headers["x-tenant-id"])) },
  { method: "GET", pattern: "/dashboard/activity", handler: (r) => ok(dashboard.activity(r.headers["x-tenant-id"])) },

  // Moderation
  { method: "GET", pattern: "/moderation", handler: (r) => ok(moderation.list(r.headers["x-tenant-id"], r.params)) },
  { method: "POST", pattern: "/moderation/:id/approve", handler: (r, p) => ok(moderation.approve(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/moderation/:id/reject", handler: (r, p) => ok(moderation.reject(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/moderation/:id/escalate", handler: (r, p) => ok(moderation.escalate(r.headers["x-tenant-id"], p.id)) },

  // Reports
  { method: "GET", pattern: "/reports", handler: (r) => ok(reports.list(r.headers["x-tenant-id"], r.params)) },
  { method: "POST", pattern: "/reports/:id/resolve", handler: (r, p) => ok(reports.resolve(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/reports/:id/dismiss", handler: (r, p) => ok(reports.dismiss(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/reports/:id/investigate", handler: (r, p) => ok(reports.investigate(r.headers["x-tenant-id"], p.id)) },

  // Matches
  { method: "GET", pattern: "/matches", handler: (r) => ok(matches.list(r.headers["x-tenant-id"], r.params)) },

  // Messages
  { method: "GET", pattern: "/messages/conversations", handler: (r) => ok(messages.list(r.headers["x-tenant-id"], r.params)) },
  { method: "GET", pattern: "/messages/conversations/:id/messages", handler: (r, p) => ok(messages.messages(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/messages/:id/flag", handler: (r, p) => ok(messages.flagMessage(r.headers["x-tenant-id"], p.id, r.body)) },

  // Subscriptions
  { method: "GET", pattern: "/subscriptions/overview", handler: (r) => ok(subscriptions.overview(r.headers["x-tenant-id"])) },
  { method: "GET", pattern: "/subscriptions/subscribers", handler: (r) => ok(subscriptions.list(r.headers["x-tenant-id"], r.params)) },
  { method: "POST", pattern: "/subscriptions/subscribers/:id/refund", handler: (r, p) => ok(subscriptions.refund(r.headers["x-tenant-id"], p.id)) },
  { method: "POST", pattern: "/subscriptions/subscribers/:id/cancel", handler: (r, p) => ok(subscriptions.cancel(r.headers["x-tenant-id"], p.id)) },

  // Analytics
  { method: "GET", pattern: "/analytics", handler: (r) => ok(analytics.getData(r.headers["x-tenant-id"], r.params)) },

  // Settings
  { method: "GET", pattern: "/settings", handler: (r) => ok(settings.get(r.headers["x-tenant-id"])) },
  { method: "PATCH", pattern: "/settings", handler: (r) => ok(settings.update(r.headers["x-tenant-id"], r.body)) },
  { method: "PATCH", pattern: "/settings/flags/:key", handler: (r, p) => ok(settings.toggleFlag(r.headers["x-tenant-id"], p.key, r.body)) },

  // Audit
  { method: "GET", pattern: "/audit", handler: (r) => ok(audit.list(r.headers["x-tenant-id"], r.params)) },
  { method: "GET", pattern: "/admin/audit", handler: (r) => ok(audit.listGlobal(r.params)) },
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
