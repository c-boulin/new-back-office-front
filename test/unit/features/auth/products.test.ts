import { describe, it, expect } from "vitest";
import {
  hexToHslTriplet,
  lightenTriplet,
  parseProducts,
  productColors,
  productsResponseToList,
} from "@/features/auth/products";

describe("hexToHslTriplet", () => {
  it("converts #RRGGBB to an HSL triplet", () => {
    expect(hexToHslTriplet("#3fb28c")).toBe("160 48% 47%");
  });

  it("accepts #RGB shorthand", () => {
    expect(hexToHslTriplet("#f00")).toBe("0 100% 50%");
  });

  it("returns null for garbage input", () => {
    expect(hexToHslTriplet("nope")).toBeNull();
    expect(hexToHslTriplet("#12345")).toBeNull();
    expect(hexToHslTriplet("")).toBeNull();
  });
});

describe("lightenTriplet", () => {
  it("raises lightness by ~12 points, capped at 82", () => {
    expect(lightenTriplet("158 47% 47%")).toBe("158 47% 59%");
    expect(lightenTriplet("158 47% 75%")).toBe("158 47% 82%");
  });

  it("returns the input untouched when it isn't an HSL triplet", () => {
    expect(lightenTriplet("garbage")).toBe("garbage");
  });
});

describe("productColors", () => {
  it("returns the branded pair for a known slug", () => {
    expect(productColors(101, "woozgo")).toEqual({
      hue: "158 34% 52%",
      accent: "158 34% 62%",
    });
  });

  it("prefers the server-provided hex color when present", () => {
    const server = productColors(101, "woozgo", "#e53e6b");
    expect(server.hue).toBe(hexToHslTriplet("#e53e6b"));
    expect(server.accent).toBe(lightenTriplet(server.hue));
  });

  it("accepts a bare HSL triplet from the server", () => {
    expect(productColors(1, "x", "200 60% 40%").hue).toBe("200 60% 40%");
  });

  it("ignores an invalid server color and falls back to the slug", () => {
    expect(productColors(101, "woozgo", "not-a-color")).toEqual({
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
        { id: 1, name: "Alpha", slug: "alpha", color: null },
        { id: 2, name: "Beta", slug: null },
      ],
    });
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ id: 1, name: "Alpha", slug: "alpha", color: null });
    expect(list[1]).toMatchObject({ id: 2, name: "Beta", slug: null, color: null });
    expect(list[0].hue).toBeTruthy();
    expect(list[1].hue).toBeTruthy();
  });

  it("uses the server hex when provided", () => {
    const [product] = productsResponseToList({
      data: [{ id: 7, name: "Custom", slug: "custom", color: "#199fe0" }],
    });
    expect(product.color).toBe("#199fe0");
    expect(product.hue).toBe(hexToHslTriplet("#199fe0"));
  });
});

describe("parseProducts", () => {
  it("accepts a valid API payload with an optional color", () => {
    const list = parseProducts({
      data: [{ id: 69, name: "Woozgo", slug: "woozgo", color: "#3fb28c" }],
    });
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("Woozgo");
    expect(list[0].color).toBe("#3fb28c");
  });

  it("accepts an entry without a color field", () => {
    const list = parseProducts({
      data: [{ id: 1, name: "NoColor", slug: "nc" }],
    });
    expect(list[0].color).toBeNull();
  });

  it("rejects a malformed payload", () => {
    expect(() => parseProducts({ wrong: [] })).toThrow();
    expect(() => parseProducts({ data: [{ id: "nope", name: "x", slug: null }] })).toThrow();
  });
});
