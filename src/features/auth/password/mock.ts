import { AppError } from "@/lib/httpClient";
import type { RawPasswordSession } from "./schemas";

type MockAccount = {
  identifier: string;
  password: string;
  session: () => RawPasswordSession;
};

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

const accounts: MockAccount[] = [
  {
    identifier: "admin",
    password: "admin",
    session: () => ({
      access_token: fakeToken("admin"),
      refresh_token: fakeToken("admin-refresh"),
      expires_at: expiresAt(),
      user: {
        id: "usr_super_admin",
        name: "Alex Morgan",
        email: "admin@watchtower.local",
        avatar_url: null,
        is_super_admin: true,
      },
      memberships: [],
    }),
  },
  {
    identifier: "operator",
    password: "operator",
    session: () => ({
      access_token: fakeToken("operator"),
      refresh_token: fakeToken("operator-refresh"),
      expires_at: expiresAt(),
      user: {
        id: "usr_operator",
        name: "Jamie Rivera",
        email: "jamie@watchtower.local",
        avatar_url: null,
        is_super_admin: false,
      },
      memberships: [
        {
          tenant_id: "tnt_luna",
          tenant_slug: "luna",
          tenant_name: "Luna",
          role: "admin",
          permissions: ["users.read", "users.write", "moderation.read"],
          theme: {
            primary: "199 89% 55%",
            accent: "174 72% 48%",
            background: "222 47% 6%",
            foreground: "210 40% 98%",
            radius: "0.75rem",
            font_sans: "Inter, system-ui, sans-serif",
          },
          last_accessed_at: null,
        },
        {
          tenant_id: "tnt_orbit",
          tenant_slug: "orbit",
          tenant_name: "Orbit",
          role: "moderator",
          permissions: ["users.read", "moderation.read"],
          theme: {
            primary: "162 63% 41%",
            accent: "35 92% 55%",
            background: "222 47% 6%",
            foreground: "210 40% 98%",
            radius: "0.75rem",
            font_sans: "Inter, system-ui, sans-serif",
          },
          last_accessed_at: null,
        },
      ],
    }),
  },
];

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function mockPasswordLogin(
  identifier: string,
  password: string,
): Promise<RawPasswordSession> {
  await delay(450);
  const normalized = identifier.trim().toLowerCase();
  const match = accounts.find(
    (a) => a.identifier === normalized && a.password === password,
  );
  if (!match) {
    throw new AppError("unauthorized", "Invalid credentials", 401);
  }
  return match.session();
}

export async function mockPasswordRefresh(
  refreshToken: string,
): Promise<RawPasswordSession> {
  await delay(200);
  const subject = refreshToken.includes("admin") ? "admin" : "operator";
  const match = accounts.find((a) => a.identifier === subject);
  if (!match) {
    throw new AppError("unauthorized", "Session expired", 401);
  }
  return match.session();
}

export async function mockPasswordLogout(): Promise<void> {
  await delay(120);
}
