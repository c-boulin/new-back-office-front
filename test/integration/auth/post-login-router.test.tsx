import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { StrictMode } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { PostLoginRouter } from "@/features/auth/pages/PostLoginRouter";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  signInAs,
  operatorFixture,
  superAdminFixture,
  membershipFixture,
} from "@test/utils/fixtures";

vi.mock("@/features/auth/api", async (importActual) => {
  const actual = await importActual<typeof import("@/features/auth/api")>();
  return {
    ...actual,
    fetchMe: vi.fn().mockImplementation(async () => {
      throw new Error("fetchMe should not be called when [\"auth\", \"me\"] is pre-seeded");
    }),
  };
});

function TenantEcho() {
  const { tenantSlug } = useParams();
  return <div data-testid="tenant-shell">tenant:{tenantSlug}</div>;
}

function Shell() {
  return (
    <StrictMode>
      <Routes>
        <Route path="/" element={<PostLoginRouter />} />
        <Route path="/admin" element={<div>admin-shell</div>} />
        <Route path="/access-denied" element={<div>access-denied</div>} />
        <Route path="/t/:tenantSlug" element={<TenantEcho />} />
      </Routes>
    </StrictMode>
  );
}

function seedMe(memberships: ReturnType<typeof membershipFixture>[]) {
  const user = { ...operatorFixture };
  signInAs(user, memberships);
  return { user, memberships };
}

describe("PostLoginRouter", () => {
  beforeEach(() => {
    resetStores();
    sessionStorage.clear();
  });

  it("routes super admins to /admin", async () => {
    signInAs(superAdminFixture, []);
    const { queryClient } = renderWithProviders(<Shell />, { route: "/" });
    queryClient.setQueryData(["auth", "me"], {
      user: superAdminFixture,
      memberships: [],
    });
    expect(await screen.findByText("admin-shell")).toBeInTheDocument();
  });

  it("routes to the selected product's tenant when its id is persisted", async () => {
    const memberships = [
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
      membershipFixture({
        tenantId: "102",
        tenantSlug: "weezchat-fr",
        tenantName: "Weezchat FR",
      }),
      membershipFixture({
        tenantId: "106",
        tenantSlug: "swipi",
        tenantName: "Swipi",
      }),
    ];
    const seeded = seedMe(memberships);
    sessionStorage.setItem("auth.selectedProductId", "102");

    const { queryClient } = renderWithProviders(<Shell />, { route: "/" });
    queryClient.setQueryData(["auth", "me"], seeded);

    expect(await screen.findByTestId("tenant-shell")).toHaveTextContent("tenant:weezchat-fr");
  });

  it("keeps routing to the selected tenant even after a StrictMode double render", async () => {
    const memberships = [
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
      membershipFixture({
        tenantId: "106",
        tenantSlug: "swipi",
        tenantName: "Swipi",
      }),
    ];
    const seeded = seedMe(memberships);
    sessionStorage.setItem("auth.selectedProductId", "106");

    const { queryClient } = renderWithProviders(<Shell />, { route: "/" });
    queryClient.setQueryData(["auth", "me"], seeded);

    expect(await screen.findByTestId("tenant-shell")).toHaveTextContent("tenant:swipi");
    // Regression guard: the id must survive the render so a second pass (StrictMode / re-render)
    // doesn't fall back to the first membership.
    expect(sessionStorage.getItem("auth.selectedProductId")).toBe("106");
  });

  it("falls back to the first membership when no id is persisted", async () => {
    const memberships = [
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
      membershipFixture({
        tenantId: "102",
        tenantSlug: "weezchat-fr",
        tenantName: "Weezchat FR",
      }),
    ];
    const seeded = seedMe(memberships);

    const { queryClient } = renderWithProviders(<Shell />, { route: "/" });
    queryClient.setQueryData(["auth", "me"], seeded);

    expect(await screen.findByTestId("tenant-shell")).toHaveTextContent("tenant:woozgo");
  });

  it("redirects to /access-denied when the user has no memberships", async () => {
    const seeded = seedMe([]);

    const { queryClient } = renderWithProviders(<Shell />, { route: "/" });
    queryClient.setQueryData(["auth", "me"], seeded);

    expect(await screen.findByText("access-denied")).toBeInTheDocument();
  });
});
