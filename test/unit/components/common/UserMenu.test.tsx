import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserMenu } from "@/components/common/UserMenu";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import { resetStores, signInAs, operatorFixture, superAdminFixture } from "@test/utils/fixtures";

vi.mock("@/lib/oidcClient", () => ({
  oidcClient: { signoutRedirect: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock("@/features/auth/password/api", () => ({
  passwordLogout: vi.fn().mockResolvedValue(undefined),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    resetStores();
  });

  it("renders nothing when there is no user", () => {
    const { container } = renderWithProviders(<UserMenu />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the user's name and email in the menu", async () => {
    signInAs(operatorFixture);
    renderWithProviders(<UserMenu />);
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByText(operatorFixture.email)).toBeInTheDocument();
  });

  it("shows super admin item only for super admins", async () => {
    signInAs(superAdminFixture);
    renderWithProviders(<UserMenu />);
    await userEvent.click(screen.getByRole("button"));
    expect(await screen.findByRole("menuitem", { name: /super admin/i })).toBeInTheDocument();
  });

  it("clears auth state on logout for password method", async () => {
    signInAs(operatorFixture);
    renderWithProviders(<UserMenu />);
    await userEvent.click(screen.getByRole("button"));
    const logout = await screen.findByRole("menuitem", { name: /sign out/i });
    await userEvent.click(logout);
    await vi.waitFor(() => {
      expect(useAuthStore.getState().status).toBe("unauthenticated");
      expect(useAuthStore.getState().user).toBeNull();
    });
  });
});
