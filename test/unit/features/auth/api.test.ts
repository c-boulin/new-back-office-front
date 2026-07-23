import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "@/lib/httpClient";
import {
  fetchProducts,
  passwordLogin,
  ssoInit,
  ssoLogin,
} from "@/features/auth/api";

const loginPayload = {
  access_token: "at",
  refresh_token: "rt",
  user: {
    name: "Alice",
    email: "alice@example.com",
    role: { id: 1, name: "admin" },
    products: [
      { id: 42, name: "Orbit", slug: "orbit", role: { id: 1, name: "admin" } },
    ],
  },
};

describe("auth api", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("ssoInit forwards the selected product id, not the env default", async () => {
    const getSpy = vi.spyOn(httpClient, "get").mockResolvedValueOnce({
      data: { data: { url: "https://sso.example.com/authorize?state=xyz" } },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} } as never,
    });

    const callbackUrl = "https://preview.example.com/auth/callback";
    const authorizeUrl = await ssoInit(callbackUrl, 123);

    expect(authorizeUrl).toBe("https://sso.example.com/authorize?state=xyz");
    expect(getSpy).toHaveBeenCalledWith("/v1/auth/sso/init", {
      params: {
        callback_url: callbackUrl,
        product_id: 123,
      },
    });
  });

  it("passwordLogin sends the selected product id in the body", async () => {
    const postSpy = vi.spyOn(httpClient, "post").mockResolvedValueOnce({
      data: loginPayload,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} } as never,
    });

    await passwordLogin({ email: "alice@example.com", password: "hunter2" }, 42);

    expect(postSpy).toHaveBeenCalledWith("/v1/auth/login", {
      email: "alice@example.com",
      password: "hunter2",
      product_id: 42,
    });
  });

  it("ssoLogin sends the selected product id alongside the sesame token", async () => {
    const postSpy = vi.spyOn(httpClient, "post").mockResolvedValueOnce({
      data: loginPayload,
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} } as never,
    });

    await ssoLogin("sesame-abc", 77);

    expect(postSpy).toHaveBeenCalledWith("/v1/auth/sso/login", {
      sesame_token: "sesame-abc",
      product_id: 77,
    });
  });

  it("fetchProducts validates + maps the API list into domain products with colors", async () => {
    vi.spyOn(httpClient, "get").mockResolvedValueOnce({
      data: {
        data: [
          { id: 69, name: "Woozgo", slug: "woozgo" },
          { id: 200, name: "Newland", slug: "newland" },
        ],
      },
      status: 200,
      statusText: "OK",
      headers: {},
      config: { headers: {} } as never,
    });

    const products = await fetchProducts();
    expect(products).toHaveLength(2);
    expect(products[0]).toMatchObject({ id: 69, name: "Woozgo", slug: "woozgo" });
    expect(products[0].hue).toBeTruthy();
    expect(products[1].hue).toBeTruthy();
  });
});
