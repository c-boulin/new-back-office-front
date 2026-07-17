import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/stores/authStore";
import { operatorFixture, superAdminFixture, membershipFixture } from "@test/utils/fixtures";

function reset() {
  useAuthStore.setState({
    status: "idle",
    method: null,
    user: null,
    accessToken: null,
    idToken: null,
    refreshToken: null,
    expiresAt: null,
    memberships: [],
  });
}

describe("authStore", () => {
  beforeEach(() => reset());

  it("starts idle with no user", () => {
    const s = useAuthStore.getState();
    expect(s.status).toBe("idle");
    expect(s.user).toBeNull();
    expect(s.memberships).toEqual([]);
  });

  it("markAuthenticating flips status", () => {
    useAuthStore.getState().markAuthenticating();
    expect(useAuthStore.getState().status).toBe("authenticating");
  });

  it("setSession stores tokens and marks authenticated when token present", () => {
    useAuthStore.getState().setSession({
      accessToken: "t",
      refreshToken: "r",
      expiresAt: 12345,
      method: "password",
    });
    const s = useAuthStore.getState();
    expect(s.accessToken).toBe("t");
    expect(s.refreshToken).toBe("r");
    expect(s.method).toBe("password");
    expect(s.status).toBe("authenticated");
  });

  it("setSession without accessToken keeps prior status", () => {
    useAuthStore.getState().setSession({
      accessToken: null,
      expiresAt: null,
      method: "sso",
    });
    expect(useAuthStore.getState().status).toBe("idle");
    expect(useAuthStore.getState().method).toBe("sso");
  });

  it("setUser records user and memberships and marks authenticated", () => {
    const m = membershipFixture();
    useAuthStore.getState().setUser(operatorFixture, [m]);
    const s = useAuthStore.getState();
    expect(s.user).toEqual(operatorFixture);
    expect(s.memberships).toEqual([m]);
    expect(s.status).toBe("authenticated");
  });

  it("markSessionExpired clears the token and flags expired", () => {
    useAuthStore.getState().setSession({
      accessToken: "t",
      expiresAt: 1,
      method: "password",
    });
    useAuthStore.getState().markSessionExpired();
    const s = useAuthStore.getState();
    expect(s.status).toBe("expired");
    expect(s.accessToken).toBeNull();
  });

  it("clear resets to unauthenticated", () => {
    useAuthStore.getState().setUser(superAdminFixture, [membershipFixture()]);
    useAuthStore.getState().clear();
    const s = useAuthStore.getState();
    expect(s.status).toBe("unauthenticated");
    expect(s.user).toBeNull();
    expect(s.memberships).toEqual([]);
    expect(s.accessToken).toBeNull();
    expect(s.method).toBeNull();
  });
});
