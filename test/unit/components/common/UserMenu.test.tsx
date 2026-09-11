import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "@/components/common/UserMenu";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import {
  resetStores,
  signInAs,
  operatorFixture,
  membershipFixture,
  activateTenant,
} from "@test/utils/fixtures";

vi.mock("@/features/auth/api", () => ({
  logoutRequest: vi.fn().mockResolvedValue(undefined),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    resetStores();
  });

  it("renders nothing when there is no user", () => {
    const { container } = renderWithProviders(<UserMenu />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the user's name and role", () => {
    const membership = membershipFixture({ role: "admin" });
    signInAs(operatorFixture, [membership]);
    activateTenant(membership.tenantId, membership.tenantSlug);
    renderWithProviders(<UserMenu />);
    expect(screen.getByText(operatorFixture.name)).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });

  it("clears auth state on logout", async () => {
    signInAs(operatorFixture);
    renderWithProviders(<UserMenu />);
    const logout = screen.getByRole("button", { name: /sign out/i });
    await userEvent.click(logout);
    await vi.waitFor(() => {
      expect(useAuthStore.getState().status).toBe("unauthenticated");
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
