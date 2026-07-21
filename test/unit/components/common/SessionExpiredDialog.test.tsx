import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SessionExpiredDialog } from "@/components/common/SessionExpiredDialog";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import { resetStores, operatorFixture } from "@test/utils/fixtures";

describe("SessionExpiredDialog", () => {
  beforeEach(() => {
    resetStores();
  });

  it("is hidden when status is not 'expired'", () => {
    renderWithProviders(<SessionExpiredDialog />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens when status is 'expired' and clears auth on reauth click", async () => {
    useAuthStore.setState({
      status: "expired",
      method: "password",
      user: operatorFixture,
      accessToken: null,
      refreshToken: null,
      memberships: [],
    });
    renderWithProviders(<SessionExpiredDialog />);
    const btn = await screen.findByRole("button", { name: /sign in again/i });
    expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });

  it("routes the SSO branch through the same clear-and-navigate flow", async () => {
    useAuthStore.setState({
      status: "expired",
      method: "sso",
      user: operatorFixture,
      accessToken: null,
      refreshToken: null,
      memberships: [],
    });
    renderWithProviders(<SessionExpiredDialog />);
    const btn = await screen.findByRole("button", { name: /sign in again/i });
    await userEvent.click(btn);
    expect(useAuthStore.getState().status).toBe("unauthenticated");
  });
});
