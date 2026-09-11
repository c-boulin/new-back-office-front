import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { TenantLayout } from "@/app/layouts/TenantLayout";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  signInAs,
  operatorFixture,
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

  it("renders the sidebar with navigation links", () => {
    signInAs(operatorFixture, [membershipFixture()]);
    renderTenantLayout();
    expect(screen.getByRole("link", { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /users/i })).toBeInTheDocument();
  });

  it("does not show a link to /admin", () => {
    signInAs(operatorFixture, [membershipFixture()]);
    renderTenantLayout();
    const adminLink = screen
      .queryAllByRole("link")
      .find((el) => el.getAttribute("href") === "/admin");
    expect(adminLink).toBeUndefined();
  });
});
