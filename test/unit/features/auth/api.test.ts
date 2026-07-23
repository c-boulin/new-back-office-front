import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "@/lib/httpClient";
import { passwordLogin, ssoInit, ssoLogin } from "@/features/auth/api";

const loginPayload = {
  access_token: "at",
  refresh_token: "rt",
  user: {
    name: "Alice",
    email: "alice@example.com",
    isSuperAdmin: false,
    role: null,
    products: [
      {
        id: 42,
        name: "Orbit",
        slug: "orbit",
        role: { id: 1, name: "admin" },
        permissions: ["users.read"],
      },
    ],
  },
};

describe("auth api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("ssoInit forwards only the callback URL (no product_id)", async () => {
    const getSpy = vi.spyOn(httpClient, "get").mockResolvedValueOnce({
      data: { data: { url: "https://sso.example.com/authorize?state=xyz" } },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} } as never,
    });

    const callbackUrl = "https://preview.example.com/auth/callback";
    const authorizeUrl = await ssoInit(callbackUrl);

    expect(authorizeUrl).toBe("https://sso.example.com/authorize?state=xyz");
    expect(getSpy).toHaveBeenCalledWith("/v1/auth/sso/init", {
      params: { callback_url: callbackUrl },
    });
  });

  it("passwordLogin sends only email + password", async () => {
    const postSpy = vi.spyOn(httpClient, "post").mockResolvedValueOnce({
      data: loginPayload,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} } as never,
    });

    await passwordLogin({ email: "alice@example.com", password: "hunter2" });

    expect(postSpy).toHaveBeenCalledWith("/v1/auth/login", {
      email: "alice@example.com",
      password: "hunter2",
    });
  });

  it("ssoLogin sends only the sesame token", async () => {
    const postSpy = vi.spyOn(httpClient, "post").mockResolvedValueOnce({
      data: loginPayload,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} } as never,
    });

    await ssoLogin("sesame-abc");

    expect(postSpy).toHaveBeenCalledWith("/v1/auth/sso/login", {
      sesame_token: "sesame-abc",
    });
  });
});
