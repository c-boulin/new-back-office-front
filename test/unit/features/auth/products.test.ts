import { describe, it, expect } from "vitest";
import {
  parseProducts,
  productColors,
  productsResponseToList,
} from "@/features/auth/products";

describe("productColors", () => {
  it("returns the branded pair for a known slug", () => {
    expect(productColors(101, "woozgo")).toEqual({
      hue: "158 34% 52%",
      accent: "158 34% 62%",
    });
  });

  it("derives a stable pair for unknown slugs", () => {
    const first = productColors(999, "brand-new");
    const second = productColors(999, "brand-new");
    expect(first).toEqual(second);
    expect(first.hue).toMatch(/\d+ \d+% \d+%/);
    expect(first.accent).toMatch(/\d+ \d+% \d+%/);
  });

  it("falls back to the id when the slug is missing", () => {
    const withoutSlug = productColors(42, null);
    const idOnly = productColors("42");
    expect(withoutSlug).toEqual(idOnly);
  });

  it("keeps the derived hue out of the violet band", () => {
    for (let i = 0; i < 200; i += 1) {
      const { hue } = productColors(1000 + i, `unknown-${i}`);
      const angle = Number(hue.split(" ")[0]);
      expect(angle >= 260 && angle < 305).toBe(false);
    }
  });
});

describe("productsResponseToList", () => {
  it("maps every entry through the color derivation", () => {
    const list = productsResponseToList({
      data: [
        { id: 1, name: "Alpha", slug: "alpha" },
        { id: 2, name: "Beta", slug: null },
      ],
    });
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ id: 1, name: "Alpha", slug: "alpha" });
    expect(list[1]).toMatchObject({ id: 2, name: "Beta", slug: null });
    expect(list[0].hue).toBeTruthy();
    expect(list[1].hue).toBeTruthy();
  });
});

describe("parseProducts", () => {
  it("accepts a valid API payload", () => {
    const list = parseProducts({
      data: [{ id: 69, name: "Woozgo", slug: "woozgo" }],
    });
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Woozgo");
  });

  it("rejects a malformed payload", () => {
    expect(() => parseProducts({ wrong: [] })).toThrow();
    expect(() => parseProducts({ data: [{ id: "nope", name: "x", slug: null }] })).toThrow();
  });
});
