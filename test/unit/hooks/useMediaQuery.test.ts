import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Listener = () => void;

function mockMatchMedia(initialMatches: boolean) {
  const listeners: Listener[] = [];
  const mql = {
    matches: initialMatches,
    media: "",
    onchange: null,
    addEventListener: (_event: string, cb: Listener) => listeners.push(cb),
    removeEventListener: (_event: string, cb: Listener) => {
      const idx = listeners.indexOf(cb);
      if (idx >= 0) listeners.splice(idx, 1);
    },
    dispatchEvent: () => false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as unknown as typeof window.matchMedia;
  return {
    setMatches(next: boolean) {
      mql.matches = next;
      listeners.forEach((l) => l());
    },
  };
}

describe("useMediaQuery", () => {
  it("returns the current matches value", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("re-renders when the query state changes", () => {
    const controls = mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(result.current).toBe(false);
    act(() => controls.setMatches(true));
    expect(result.current).toBe(true);
  });
});
