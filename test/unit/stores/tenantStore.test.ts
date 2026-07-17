import { describe, it, expect, beforeEach } from "vitest";
import { useTenantStore } from "@/stores/tenantStore";
import type { TenantTheme } from "@/features/tenants/types";

const theme: TenantTheme = {
  primary: "1 2% 3%",
  accent: "4 5% 6%",
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  radius: "0.5rem",
  fontSans: "Inter",
};

describe("tenantStore", () => {
  beforeEach(() => {
    useTenantStore.setState({
      activeTenantId: null,
      activeTenantSlug: null,
      activeTheme: null,
    });
    window.localStorage.removeItem("tenant.active");
  });

  it("has no active tenant by default", () => {
    const s = useTenantStore.getState();
    expect(s.activeTenantId).toBeNull();
    expect(s.activeTenantSlug).toBeNull();
    expect(s.activeTheme).toBeNull();
  });

  it("setActiveTenant stores id, slug, and theme in memory", () => {
    useTenantStore.getState().setActiveTenant({ id: "t1", slug: "luna", theme });
    const s = useTenantStore.getState();
    expect(s.activeTenantId).toBe("t1");
    expect(s.activeTenantSlug).toBe("luna");
    expect(s.activeTheme).toEqual(theme);
  });

  it("clear resets active tenant", () => {
    useTenantStore.getState().setActiveTenant({ id: "t1", slug: "luna", theme });
    useTenantStore.getState().clear();
    const s = useTenantStore.getState();
    expect(s.activeTenantId).toBeNull();
    expect(s.activeTenantSlug).toBeNull();
    expect(s.activeTheme).toBeNull();
  });

  it("does not persist activeTheme to localStorage", () => {
    useTenantStore.getState().setActiveTenant({ id: "t1", slug: "luna", theme });
    const persisted = window.localStorage.getItem("tenant.active");
    expect(persisted).not.toBeNull();
    const parsed = JSON.parse(persisted!);
    expect(parsed.state).toEqual(
      expect.objectContaining({ activeTenantId: "t1", activeTenantSlug: "luna" }),
    );
    expect(parsed.state.activeTheme).toBeUndefined();
  });
});
