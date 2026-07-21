import { describe, it, expect, vi, beforeEach } from "vitest";
import { httpClient } from "@/lib/httpClient";
import { ssoInit } from "@/features/auth/api";
import { env } from "@/lib/env";

describe("ssoInit request shape", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends both callback_url and product_id as query params", async () => {
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
      params: {
        callback_url: callbackUrl,
        product_id: env.defaultProductId,
      },
    });
  });
});
