import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "@/stores/uiStore";

describe("uiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ sidebarOpen: true, colorScheme: "system" });
  });

  it("defaults to sidebar open and system scheme", () => {
    const s = useUiStore.getState();
    expect(s.sidebarOpen).toBe(true);
    expect(s.colorScheme).toBe("system");
  });

  it("toggleSidebar flips sidebarOpen", () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(false);
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarOpen).toBe(true);
  });

  it("setSidebarOpen assigns explicitly", () => {
    useUiStore.getState().setSidebarOpen(false);
    expect(useUiStore.getState().sidebarOpen).toBe(false);
  });

  it("setColorScheme stores the value", () => {
    useUiStore.getState().setColorScheme("dark");
    expect(useUiStore.getState().colorScheme).toBe("dark");
  });
});
