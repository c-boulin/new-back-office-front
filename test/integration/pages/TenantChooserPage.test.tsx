import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TenantChooserPage } from "@/features/tenants/pages/TenantChooserPage";
import { applyTenantTheme, resetTenantTheme } from "@/lib/tenantTheme";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  signInAs,
  operatorFixture,
  membershipFixture,
} from "@test/utils/fixtures";
import type { TenantTheme } from "@/features/tenants/types";

const lunaTheme: TenantTheme = {
  primary: "199 89% 55%",
  accent: "174 72% 48%",
  background: "222 47% 6%",
  foreground: "210 40% 98%",
  radius: "0.75rem",
  fontSans: "Inter",
  card: "222 47% 8%",
  cardForeground: "210 40% 98%",
  muted: "217 33% 17%",
  mutedForeground: "215 20% 65%",
  border: "217 33% 22%",
};

describe("TenantChooserPage", () => {
  beforeEach(() => {
    resetStores();
    resetTenantTheme();
    signInAs(operatorFixture, [
      membershipFixture({
        tenantId: "tnt_luna",
        tenantSlug: "luna",
        tenantName: "Luna",
        theme: lunaTheme,
      }),
      membershipFixture({
        tenantId: "tnt_orbit",
        tenantSlug: "orbit",
        tenantName: "Orbit",
        theme: null,
      }),
    ]);
  });

  it("renders both memberships", () => {
    renderWithProviders(<TenantChooserPage />, { route: "/tenants" });
    expect(screen.getByRole("button", { name: /luna/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /orbit/i })).toBeInTheDocument();
  });

  it("resets a leaked tenant theme when mounted", () => {
    applyTenantTheme(lunaTheme);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      "222 47% 6%",
    );

    renderWithProviders(<TenantChooserPage />, { route: "/tenants" });

    expect(document.documentElement.style.getPropertyValue("--background")).toBe("");
    expect(document.documentElement.style.getPropertyValue("--card")).toBe("");
  });

  it("filters via the search box", async () => {
    renderWithProviders(<TenantChooserPage />, { route: "/tenants" });
    const search = screen.getByRole("searchbox");
    await userEvent.type(search, "orb");
    await vi.waitFor(
      () => {
        expect(screen.queryByRole("button", { name: /^luna$/i })).not.toBeInTheDocument();
      },
      { timeout: 2000 },
    );
    expect(screen.getByRole("button", { name: /orbit/i })).toBeInTheDocument();
  });
});
