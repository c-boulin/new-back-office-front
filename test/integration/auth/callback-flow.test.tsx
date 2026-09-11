import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { CallbackPage } from "@/features/auth/pages/CallbackPage";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import { resetStores } from "@test/utils/fixtures";

const ssoLoginMock = vi.fn();

vi.mock("@/features/auth/api", async (importActual) => {
  const actual = await importActual<typeof import("@/features/auth/api")>();
  return {
    ...actual,
    ssoLogin: (...args: Parameters<typeof actual.ssoLogin>) => ssoLoginMock(...args),
  };
});

function Shell() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route path="/login" element={<div>login-screen</div>} />
      <Route path="/" element={<div>home-screen</div>} />
    </Routes>
  );
}

const ssoSessionFixture = {
  accessToken: "at",
  refreshToken: "rt",
  user: {
    id: "op@example.com",
    email: "op@example.com",
    name: "Op",
    avatarUrl: null,
    isSuperAdmin: false,
  },
  memberships: [],
};

describe("SSO callback flow", () => {
  beforeEach(() => {
    resetStores();
    ssoLoginMock.mockReset();
  });

  it("shows an error and skips the API when status=ko", async () => {
    renderWithProviders(<Shell />, { route: "/auth/callback?status=ko" });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(ssoLoginMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed sesame_token", async () => {
    renderWithProviders(<Shell />, { route: "/auth/callback?status=ok&sesame_token=short" });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(ssoLoginMock).not.toHaveBeenCalled();
  });

  it("calls ssoLogin with only the token and continues to the home route", async () => {
    ssoLoginMock.mockResolvedValueOnce(ssoSessionFixture);
    const token = "AbCdEfGhIjKlMnOpQrStUvWxYz1234";
    renderWithProviders(<Shell />, {
      route: `/auth/callback?status=ok&sesame_token=${token}`,
    });
    expect(await screen.findByText("home-screen")).toBeInTheDocument();
    expect(ssoLoginMock).toHaveBeenCalledWith(token);
    expect(ssoLoginMock).toHaveBeenCalledTimes(1);
  });

  it("surfaces an error when the SSO login fails", async () => {
    ssoLoginMock.mockRejectedValueOnce(new Error("boom"));
    const token = "AbCdEfGhIjKlMnOpQrStUvWxYz1234";
    renderWithProviders(<Shell />, {
      route: `/auth/callback?status=ok&sesame_token=${token}`,
    });
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });
});
