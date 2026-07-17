import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import { resetStores, operatorFixture } from "@test/utils/fixtures";

vi.mock("@/lib/oidcClient", () => ({
  oidcClient: { signinRedirect: vi.fn().mockResolvedValue(undefined) },
}));

describe("SessionExpiredDialog", () => {
  beforeEach(() => {
    resetStores();
  });

  it("is hidden when status is not 'expired'", () => {
    renderWithProviders(<SessionExpiredDialog />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens when status is 'expired' and offers a re-sign-in action", async () => {
    useAuthStore.setState({
      status: "expired",
      method: "password",
      user: operatorFixture,
      accessToken: null,
      idToken: null,
      refreshToken: null,
      expiresAt: null,
      memberships: [],
    });
    renderWithProviders(<SessionExpiredDialog />);
    const btn = await screen.findByRole("button", { name: /sign in again/i });
    expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("triggers signinRedirect for sso method", async () => {
    const { oidcClient } = await import("@/lib/oidcClient");
    useAuthStore.setState({
      status: "expired",
      method: "sso",
      user: operatorFixture,
      accessToken: null,
      idToken: null,
      refreshToken: null,
      expiresAt: null,
      memberships: [],
    });
    renderWithProviders(<SessionExpiredDialog />);
    const btn = await screen.findByRole("button", { name: /sign in again/i });
    await userEvent.click(btn);
    expect(oidcClient.signinRedirect).toHaveBeenCalledOnce();
  });
});
