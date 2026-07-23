import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { TenantLayout } from "@/app/layouts/TenantLayout";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  signInAs,
  operatorFixture,
  superAdminFixture,
  membershipFixture,
  activateTenant,
} from "@test/utils/fixtures";

function renderTenantLayout() {
  return renderWithProviders(
    <Routes>
      <Route path="/t/:tenantSlug" element={<TenantLayout />}>
        <Route index element={<div>dashboard</div>} />
      </Route>
    </Routes>,
    { route: "/t/luna" },
  );
}

describe("TenantLayout", () => {
  beforeEach(() => {
    resetStores();
    activateTenant("t_luna", "luna");
  });

  it("shows the super admin console link when the user is a super admin", () => {
    signInAs(superAdminFixture, [membershipFixture()]);
    renderTenantLayout();
    const links = screen.getAllByRole("link", { name: /super admin/i });
    expect(links.some((el) => el.getAttribute("href") === "/admin")).toBe(true);
  });

  it("hides the super admin console link for regular users", () => {
    signInAs(operatorFixture, [membershipFixture()]);
    renderTenantLayout();
    const superAdminLink = screen
      .queryAllByRole("link")
      .find((el) => el.getAttribute("href") === "/admin");
    expect(superAdminLink).toBeUndefined();
  });
});
