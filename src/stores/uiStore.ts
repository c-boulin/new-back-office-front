import { create } from "zustand";
import { persist } from "zustand/middleware";

type UiState = {
  sidebarOpen: boolean;
  colorScheme: "light" | "dark" | "system";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setColorScheme: (scheme: "light" | "dark" | "system") => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      colorScheme: "system",
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setColorScheme: (scheme) => set({ colorScheme: scheme }),
    }),
    { name: "ui.preferences" },
  ),
);
