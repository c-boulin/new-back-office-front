import { describe, it, expect, beforeEach } from "vitest";
import { useProductsStore } from "@/stores/productsStore";
import { rawProductToProduct } from "@/features/auth/products";

const sample = () => [
  rawProductToProduct({ id: 1, name: "Alpha", slug: "alpha", color: "#3fb28c" }),
  rawProductToProduct({ id: 2, name: "Beta", slug: "beta", color: null }),
];

describe("useProductsStore", () => {
  beforeEach(() => {
    useProductsStore.getState().clear();
  });

  it("starts empty and can be populated", () => {
    expect(useProductsStore.getState().products).toEqual([]);
    useProductsStore.getState().setProducts(sample());
    expect(useProductsStore.getState().products).toHaveLength(2);
  });

  it("looks up a product by id", () => {
    useProductsStore.getState().setProducts(sample());
    expect(useProductsStore.getState().findById(1)?.name).toBe("Alpha");
    expect(useProductsStore.getState().findById(999)).toBeNull();
  });

  it("clears the cached list", () => {
    useProductsStore.getState().setProducts(sample());
    useProductsStore.getState().clear();
    expect(useProductsStore.getState().products).toEqual([]);
  });
});
