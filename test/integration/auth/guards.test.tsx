import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { RequireAuth } from "@/app/guards/RequireAuth";
import { RequireSuperAdmin } from "@/app/guards/RequireSuperAdmin";
import { RequireTenant } from "@/app/guards/RequireTenant";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  signInAs,
  operatorFixture,
  superAdminFixture,
  membershipFixture,
} from "@test/utils/fixtures";

describe("route guards", () => {
  beforeEach(() => {
    resetStores();
  });

  describe("RequireAuth", () => {
    function Shell() {
      return (
        <Routes>
          <Route element={<RequireAuth />}>
            <Route path="/private" element={<div>private-content</div>} />
          </Route>
          <Route path="/login" element={<div>login-screen</div>} />
        </Routes>
      );
    }

    it("redirects to /login when unauthenticated", async () => {
      renderWithProviders(<Shell />, { route: "/private" });
      expect(await screen.findByText("login-screen")).toBeInTheDocument();
    });

    it("renders the outlet when authenticated", async () => {
      signInAs(operatorFixture, [membershipFixture()]);
      renderWithProviders(<Shell />, { route: "/private" });
      expect(await screen.findByText("private-content")).toBeInTheDocument();
    });
  });

  describe("RequireSuperAdmin", () => {
    function Shell() {
      return (
        <Routes>
          <Route element={<RequireSuperAdmin />}>
            <Route path="/admin" element={<div>admin-content</div>} />
          </Route>
          <Route path="/" element={<div>home</div>} />
        </Routes>
      );
    }

    it("redirects non-super-admins to /", async () => {
      signInAs(operatorFixture, [membershipFixture()]);
      renderWithProviders(<Shell />, { route: "/admin" });
      expect(await screen.findByText("home")).toBeInTheDocument();
    });

    it("allows super admins through", async () => {
      signInAs(superAdminFixture);
      renderWithProviders(<Shell />, { route: "/admin" });
      expect(await screen.findByText("admin-content")).toBeInTheDocument();
    });
  });

  describe("RequireTenant", () => {
    function Shell() {
      return (
        <Routes>
          <Route path="/t/:tenantSlug" element={<RequireTenant />}>
            <Route index element={<div>tenant-shell</div>} />
          </Route>
          <Route path="/" element={<div>post-login</div>} />
        </Routes>
      );
    }

    it("redirects to the post-login resolver when slug does not match a membership", async () => {
      signInAs(operatorFixture, [membershipFixture({ tenantSlug: "luna", tenantId: "t_luna" })]);
      renderWithProviders(<Shell />, { route: "/t/unknown" });
      expect(await screen.findByText("post-login")).toBeInTheDocument();
    });

    it("renders the tenant outlet when slug matches", async () => {
      signInAs(operatorFixture, [membershipFixture({ tenantSlug: "luna", tenantId: "t_luna" })]);
      renderWithProviders(<Shell />, { route: "/t/luna" });
      expect(await screen.findByText("tenant-shell")).toBeInTheDocument();
    });
  });
});
