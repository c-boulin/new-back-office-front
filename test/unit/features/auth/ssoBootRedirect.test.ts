import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { normalizeSsoCallbackLocation } from "@/features/auth/ssoBootRedirect";

interface MutableLocation {
  origin: string;
  pathname: string;
  search: string;
  hash: string;
  href: string;
}

const originalLocation = window.location;
const originalHistory = window.history;
let mockLocation: MutableLocation;
let replaceStateSpy: ReturnType<typeof vi.fn>;

function installLocation(pathname: string, search: string, hash = "") {
  mockLocation = {
    origin: "https://tools.dating.dve-dev.com",
    pathname,
    search,
    hash,
    href: `https://tools.dating.dve-dev.com${pathname}${search}${hash}`,
  };
  Object.defineProperty(window, "location", {
    configurable: true,
    value: mockLocation,
  });
}

beforeEach(() => {
  replaceStateSpy = vi.fn((_state, _title, url: string) => {
    const parsed = new URL(url, mockLocation.origin);
    mockLocation.pathname = parsed.pathname;
    mockLocation.search = parsed.search;
    mockLocation.hash = parsed.hash;
    mockLocation.href = `${mockLocation.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
  });
  Object.defineProperty(window, "history", {
    configurable: true,
    value: { ...window.history, replaceState: replaceStateSpy },
  });
});

afterEach(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
  Object.defineProperty(window, "history", {
    configurable: true,
    value: originalHistory,
  });
  vi.unstubAllEnvs();
});

describe("normalizeSsoCallbackLocation", () => {
  it("rewrites index.html to the SPA callback route when a sesame_token is present", () => {
    vi.stubEnv("BASE_URL", "/pocs/bolt-dating-front-back-office/");
    installLocation(
      "/pocs/bolt-dating-front-back-office/index.html",
      "?status=ok&sesame_token=abc123",
    );

    normalizeSsoCallbackLocation();

    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    expect(mockLocation.pathname).toBe(
      "/pocs/bolt-dating-front-back-office/auth/callback",
    );
    expect(mockLocation.search).toBe("?status=ok&sesame_token=abc123");
  });

  it("also rewrites when only status is present", () => {
    vi.stubEnv("BASE_URL", "/pocs/bolt-dating-front-back-office/");
    installLocation("/pocs/bolt-dating-front-back-office/index.html", "?status=ko");

    normalizeSsoCallbackLocation();

    expect(mockLocation.pathname).toBe(
      "/pocs/bolt-dating-front-back-office/auth/callback",
    );
    expect(mockLocation.search).toBe("?status=ko");
  });

  it("is a no-op when neither sesame_token nor status is present", () => {
    vi.stubEnv("BASE_URL", "/pocs/bolt-dating-front-back-office/");
    installLocation("/pocs/bolt-dating-front-back-office/", "?other=1");

    normalizeSsoCallbackLocation();

    expect(replaceStateSpy).not.toHaveBeenCalled();
    expect(mockLocation.pathname).toBe("/pocs/bolt-dating-front-back-office/");
  });

  it("is a no-op when the browser is already on the callback route", () => {
    vi.stubEnv("BASE_URL", "/pocs/bolt-dating-front-back-office/");
    installLocation(
      "/pocs/bolt-dating-front-back-office/auth/callback",
      "?sesame_token=abc123",
    );

    normalizeSsoCallbackLocation();

    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it("works at the root deploy (BASE_URL='/')", () => {
    vi.stubEnv("BASE_URL", "/");
    installLocation("/index.html", "?sesame_token=abc123");

    normalizeSsoCallbackLocation();

    expect(mockLocation.pathname).toBe("/auth/callback");
    expect(mockLocation.search).toBe("?sesame_token=abc123");
  });

  it("preserves the URL hash when rewriting", () => {
    vi.stubEnv("BASE_URL", "/");
    installLocation("/index.html", "?sesame_token=abc123", "#anchor");

    normalizeSsoCallbackLocation();

    expect(mockLocation.pathname).toBe("/auth/callback");
    expect(mockLocation.hash).toBe("#anchor");
  });
});
