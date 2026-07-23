import { describe, it, expect } from "vitest";
import {
  hexToHslTriplet,
  lightenTriplet,
  productColors,
  apiProductToProduct,
  membershipToProduct,
} from "@/features/auth/products";
import { membershipFixture } from "@test/utils/fixtures";

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

describe("apiProductToProduct", () => {
  it("builds a UI product from an API product entry", () => {
    const product = apiProductToProduct({
      id: 101,
      name: "Woozgo",
      slug: "woozgo",
      role: { id: 1, name: "admin" },
      permissions: ["dashboard.read"],
    });
    expect(product.id).toBe(101);
    expect(product.name).toBe("Woozgo");
    expect(product.slug).toBe("woozgo");
    expect(product.color).toBeNull();
    expect(product.hue).toBe("158 34% 52%");
    expect(product.accent).toBe("158 34% 62%");
  });

  it("falls back to a null slug when the API sends null/empty", () => {
    const product = apiProductToProduct({
      id: 42,
      name: "NoSlug",
      slug: null,
      role: { id: 1, name: "admin" },
      permissions: [],
    });
    expect(product.slug).toBeNull();
    expect(product.hue).toMatch(/\d+ \d+% \d+%/);
  });
});

describe("membershipToProduct", () => {
  it("re-derives colors from the cached membership", () => {
    const product = membershipToProduct(
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
    );
    expect(product).toMatchObject({
      id: 101,
      name: "Woozgo",
      slug: "woozgo",
      hue: "158 34% 52%",
    });
  });
});
