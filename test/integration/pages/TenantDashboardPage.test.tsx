import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { TenantDashboardPage } from "@/features/dashboard/pages/TenantDashboardPage";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  activateTenant,
  signInAs,
  operatorFixture,
  membershipFixture,
} from "@test/utils/fixtures";

describe("TenantDashboardPage integration", () => {
  beforeEach(() => {
    resetStores();
    const membership = membershipFixture({
      tenantId: "tnt_luna",
      tenantSlug: "luna",
      tenantName: "Luna",
    });
    signInAs(operatorFixture, [membership]);
    activateTenant("tnt_luna", "luna");
  });

  it("renders the tenant name as page heading", async () => {
    renderWithProviders(<TenantDashboardPage />, { route: "/t/luna" });

    expect(screen.getByRole("heading", { level: 1, name: /luna/i })).toBeInTheDocument();
  });
});
