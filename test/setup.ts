import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.stubEnv("VITE_API_BASE_URL", "https://api.test.local/api");
vi.stubEnv("VITE_DEFAULT_PRODUCT_ID", "69");
vi.stubEnv("VITE_AUTH_PASSWORD_ENABLED", "true");
vi.stubEnv("VITE_AUTH_SSO_ENABLED", "true");
vi.stubEnv("VITE_AUTH_MOCK", "false");
vi.stubEnv("VITE_MOCK_API", "true");
vi.stubEnv("VITE_MOCK_PERSIST", "false");
vi.stubEnv("VITE_ENABLE_MSW", "false");

if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    }),
  });
}

if (typeof window !== "undefined") {
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
}

if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn() as unknown as Element["scrollIntoView"];
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
});
