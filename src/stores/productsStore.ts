import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Product } from "@/features/auth/products";

type ProductsState = {
  products: Product[];
  setProducts: (products: Product[]) => void;
  findById: (id: number) => Product | null;
  clear: () => void;
};

export const useProductsStore = create<ProductsState>()(
  persist(
    immer<ProductsState>((set, get) => ({
      products: [],
      setProducts: (products) =>
        set((state) => {
          state.products = products;
        }),
      findById: (id) => get().products.find((p) => p.id === id) ?? null,
      clear: () =>
        set((state) => {
          state.products = [];
        }),
    })),
    {
      name: "auth.products",
      partialize: (state) => ({ products: state.products }),
    },
  ),
);
