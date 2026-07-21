import { describe, it, expect, afterEach } from "vitest";
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
  });

  it.each([
    "http://localhost:5173",
    "https://staging.example.com",
    "https://app.example.com:8443",
  ])("builds ${origin}/auth/callback from window.location.origin=%s", (origin) => {
    setOrigin(origin);
    expect(getSsoCallbackUrl()).toBe(`${origin}/auth/callback`);
  });

  it("does not introduce double slashes when origin already ends with a slash-like value", () => {
    setOrigin("https://example.com");
    expect(getSsoCallbackUrl().split("/auth/callback").length).toBe(2);
  });
});
