import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitForElementToBeRemoved } from "@testing-library/react";
import { UsersListPage } from "@/features/users/pages/UsersListPage";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  activateTenant,
  signInAs,
  operatorFixture,
  membershipFixture,
} from "@test/utils/fixtures";

describe("UsersListPage integration", () => {
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

  it("renders the page header, then loads a table of users via the mock adapter", async () => {
    renderWithProviders(<UsersListPage />, { route: "/t/luna/users" });

    expect(screen.getByRole("heading", { level: 1, name: /users/i })).toBeInTheDocument();

    const loading = document.querySelector('[data-testid="loading-state"]');
    if (loading) {
      await waitForElementToBeRemoved(loading);
    }

    const table = await screen.findByRole("table", {}, { timeout: 4000 });
    expect(table).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /user/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /status/i })).toBeInTheDocument();
  });
});
