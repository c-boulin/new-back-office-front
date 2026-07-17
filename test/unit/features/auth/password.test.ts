import { describe, it, expect } from "vitest";
import { passwordSessionFromRaw } from "@/features/auth/password/adaptors";
import {
  passwordCredentialsSchema,
  passwordSessionSchema,
} from "@/features/auth/password/schemas";

const rawSession = {
  access_token: "a",
  refresh_token: "r",
  expires_at: 1_700_000_000,
  user: {
    id: "u1",
    name: "Alice",
    email: "alice@example.com",
    avatar_url: null,
    is_super_admin: false,
  },
  memberships: [] as Array<Record<string, never>>,
};

describe("passwordSessionFromRaw", () => {
  it("maps tokens and user", () => {
    const out = passwordSessionFromRaw({
      ...rawSession,
      memberships: [],
    });
    expect(out.accessToken).toBe("a");
    expect(out.refreshToken).toBe("r");
    expect(out.expiresAt).toBe(1_700_000_000);
    expect(out.user.name).toBe("Alice");
    expect(out.memberships).toEqual([]);
  });
});

describe("passwordCredentialsSchema", () => {
  it("accepts valid credentials", () => {
    expect(() =>
      passwordCredentialsSchema.parse({ identifier: "alice", password: "pw" }),
    ).not.toThrow();
  });

  it("rejects empty identifier", () => {
    expect(() =>
      passwordCredentialsSchema.parse({ identifier: "", password: "pw" }),
    ).toThrow();
  });

  it("rejects empty password", () => {
    expect(() =>
      passwordCredentialsSchema.parse({ identifier: "alice", password: "" }),
    ).toThrow();
  });
});

describe("passwordSessionSchema", () => {
  it("parses valid session payload", () => {
    expect(() =>
      passwordSessionSchema.parse({ ...rawSession, memberships: [] }),
    ).not.toThrow();
  });

  it("rejects non-positive expires_at", () => {
    expect(() =>
      passwordSessionSchema.parse({ ...rawSession, expires_at: 0, memberships: [] }),
    ).toThrow();
  });
});
