import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useParams } from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import { PostLoginRouter } from "@/features/auth/pages/PostLoginRouter";
import { makeTestQueryClient, renderWithProviders } from "@test/utils/renderWithProviders";
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
    <Routes>
      <Route path="/" element={<PostLoginRouter />} />
      <Route path="/admin" element={<div>admin-shell</div>} />
      <Route path="/access-denied" element={<div>access-denied</div>} />
      <Route path="/t/:tenantSlug" element={<TenantEcho />} />
    </Routes>
  );
}

function seededClient(user: unknown, memberships: unknown): QueryClient {
  const client = makeTestQueryClient();
  client.setQueryData(["auth", "me"], { user, memberships });
  return client;
}

describe("PostLoginRouter", () => {
  beforeEach(() => {
    resetStores();
    sessionStorage.clear();
  });

  it("routes super admins to /admin when they have no memberships", async () => {
    signInAs(superAdminFixture, []);
    const queryClient = seededClient(superAdminFixture, []);
    renderWithProviders(<Shell />, { route: "/", queryClient });
    expect(await screen.findByText("admin-shell")).toBeInTheDocument();
  });

  it("shows the product picker to super admins when they have multiple memberships", async () => {
    const memberships = [
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
      membershipFixture({
        tenantId: "102",
        tenantSlug: "weezchat-fr",
        tenantName: "Weezchat FR",
      }),
    ];
    signInAs(superAdminFixture, memberships);
    const queryClient = seededClient(superAdminFixture, memberships);
    renderWithProviders(<Shell />, { route: "/", queryClient });

    expect(await screen.findByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Woozgo/i })).toBeInTheDocument();
  });

  it("auto-activates the only membership for a super admin too", async () => {
    const memberships = [
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
    ];
    signInAs(superAdminFixture, memberships);
    const queryClient = seededClient(superAdminFixture, memberships);
    renderWithProviders(<Shell />, { route: "/", queryClient });
    expect(await screen.findByTestId("tenant-shell")).toHaveTextContent("tenant:woozgo");
  });

  it("auto-activates the only membership and lands on that tenant", async () => {
    const memberships = [
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
    ];
    signInAs(operatorFixture, memberships);
    const queryClient = seededClient(operatorFixture, memberships);
    renderWithProviders(<Shell />, { route: "/", queryClient });
    expect(await screen.findByTestId("tenant-shell")).toHaveTextContent("tenant:woozgo");
  });

  it("shows the product picker when the user has more than one membership", async () => {
    const memberships = [
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
      membershipFixture({
        tenantId: "102",
        tenantSlug: "weezchat-fr",
        tenantName: "Weezchat FR",
      }),
    ];
    signInAs(operatorFixture, memberships);
    const queryClient = seededClient(operatorFixture, memberships);
    renderWithProviders(<Shell />, { route: "/", queryClient });

    expect(await screen.findByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Woozgo/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Weezchat FR/i })).toBeInTheDocument();
  });

  it("navigates to the chosen product tenant when Continue is clicked", async () => {
    const memberships = [
      membershipFixture({ tenantId: "101", tenantSlug: "woozgo", tenantName: "Woozgo" }),
      membershipFixture({ tenantId: "106", tenantSlug: "swipi", tenantName: "Swipi" }),
    ];
    signInAs(operatorFixture, memberships);
    const queryClient = seededClient(operatorFixture, memberships);
    renderWithProviders(<Shell />, { route: "/", queryClient });

    await userEvent.click(await screen.findByRole("radio", { name: /Swipi/i }));
    await userEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(await screen.findByTestId("tenant-shell")).toHaveTextContent("tenant:swipi");
  });

  it("redirects to /access-denied when the user has no memberships", async () => {
    signInAs(operatorFixture, []);
    const queryClient = seededClient(operatorFixture, []);
    renderWithProviders(<Shell />, { route: "/", queryClient });
    expect(await screen.findByText("access-denied")).toBeInTheDocument();
  });
});
