import { describe, it, expect, afterEach, vi } from "vitest";
import { getSsoCallbackUrl } from "@/features/auth/ssoCallback";

const originalOrigin = window.location.origin;
const originalHref = window.location.href;

function setOrigin(origin: string) {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...window.location, origin, href: `${origin}/` },
  });
}

describe("getSsoCallbackUrl", () => {
  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, origin: originalOrigin, href: originalHref },
    });
    vi.unstubAllEnvs();
  });

  it.each([
    "http://localhost:5173",
    "https://staging.example.com",
    "https://app.example.com:8443",
  ])("builds ${origin}/index.html from window.location.origin=%s at root", (origin) => {
    vi.stubEnv("BASE_URL", "/");
    setOrigin(origin);
    expect(getSsoCallbackUrl()).toBe(`${origin}/index.html`);
  });

  it("prepends the base path when the app is deployed under a subpath", () => {
    vi.stubEnv("BASE_URL", "/pocs/bolt-dating-front-back-office/");
    setOrigin("https://tools.dating.dve-dev.com");
    expect(getSsoCallbackUrl()).toBe(
      "https://tools.dating.dve-dev.com/pocs/bolt-dating-front-back-office/index.html",
    );
  });

  it("handles arbitrary nested subpaths without introducing double slashes", () => {
    vi.stubEnv("BASE_URL", "/nested/app/");
    setOrigin("https://example.com");
    const url = getSsoCallbackUrl();
    expect(url).toBe("https://example.com/nested/app/index.html");
    expect(url.split("//").length).toBe(2);
  });

  it("targets a real file so static hosts do not 403 on SPA-only routes", () => {
    vi.stubEnv("BASE_URL", "/pocs/bolt-dating-front-back-office/");
    setOrigin("https://tools.dating.dve-dev.com");
    expect(getSsoCallbackUrl().endsWith("/index.html")).toBe(true);
  });
});
