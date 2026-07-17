import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useUrlState, urlString, urlInt, urlEnum, urlBool } from "@/hooks/useUrlState";

function wrap(route = "/") {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>;
  };
}

describe("param defs", () => {
  it("urlString parses and serializes with fallback elision", () => {
    const def = urlString("");
    expect(def.parse(null)).toBe("");
    expect(def.parse("alice")).toBe("alice");
    expect(def.serialize("")).toBeNull();
    expect(def.serialize("alice")).toBe("alice");
  });

  it("urlInt clamps invalid and honors min", () => {
    const def = urlInt(0, 0);
    expect(def.parse(null)).toBe(0);
    expect(def.parse("3")).toBe(3);
    expect(def.parse("-1")).toBe(0);
    expect(def.parse("abc")).toBe(0);
    expect(def.serialize(0)).toBeNull();
    expect(def.serialize(4)).toBe("4");
  });

  it("urlEnum rejects unknown values", () => {
    const def = urlEnum(["a", "b"] as const, "a");
    expect(def.parse("b")).toBe("b");
    expect(def.parse("c")).toBe("a");
    expect(def.serialize("a")).toBeNull();
    expect(def.serialize("b")).toBe("b");
  });

  it("urlBool parses truthy/falsy strings", () => {
    const def = urlBool(false);
    expect(def.parse("true")).toBe(true);
    expect(def.parse("false")).toBe(false);
    expect(def.parse(null)).toBe(false);
    expect(def.serialize(false)).toBeNull();
    expect(def.serialize(true)).toBe("true");
  });
});

describe("useUrlState", () => {
  it("reads defaults when URL has no params", () => {
    const { result } = renderHook(
      () =>
        useUrlState({
          q: urlString(""),
          page: urlInt(0, 0),
        }),
      { wrapper: wrap("/") },
    );
    expect(result.current[0]).toEqual({ q: "", page: 0 });
  });

  it("reads values from the URL", () => {
    const { result } = renderHook(
      () =>
        useUrlState({
          q: urlString(""),
          page: urlInt(0, 0),
        }),
      { wrapper: wrap("/?q=alice&page=2") },
    );
    expect(result.current[0]).toEqual({ q: "alice", page: 2 });
  });

  it("writes params via update and drops defaults", () => {
    function Probe() {
      const [state, update] = useUrlState({
        q: urlString(""),
        page: urlInt(0, 0),
      });
      const loc = useLocation();
      return { state, update, search: loc.search };
    }
    const { result } = renderHook(() => Probe(), { wrapper: wrap("/") });
    act(() => result.current.update({ q: "alice", page: 3 }));
    expect(result.current.state).toEqual({ q: "alice", page: 3 });
    expect(result.current.search).toContain("q=alice");
    expect(result.current.search).toContain("page=3");

    act(() => result.current.update({ q: "", page: 0 }));
    expect(result.current.search).toBe("");
  });

  it("supports functional updates", () => {
    function Probe() {
      const [state, update] = useUrlState({ page: urlInt(0, 0) });
      return { state, update };
    }
    const { result } = renderHook(() => Probe(), { wrapper: wrap("/?page=1") });
    act(() => result.current.update((prev) => ({ page: prev.page + 1 })));
    expect(result.current.state.page).toBe(2);
  });
});
