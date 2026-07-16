import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { TenantTheme } from "@/features/tenants/types";

type TenantState = {
  activeTenantId: string | null;
  activeTenantSlug: string | null;
  activeTheme: TenantTheme | null;
  setActiveTenant: (payload: {
    id: string;
    slug: string;
    theme: TenantTheme | null;
  }) => void;
  clear: () => void;
};

export const useTenantStore = create<TenantState>()(
  persist(
    immer((set) => ({
      activeTenantId: null,
      activeTenantSlug: null,
      activeTheme: null,
      setActiveTenant: ({ id, slug, theme }) =>
        set((state) => {
          state.activeTenantId = id;
          state.activeTenantSlug = slug;
          state.activeTheme = theme;
        }),
      clear: () =>
        set((state) => {
          state.activeTenantId = null;
          state.activeTenantSlug = null;
          state.activeTheme = null;
        }),
    })),
    { name: "tenant.active" },
  ),
);
