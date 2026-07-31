import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { AppError } from "@/lib/httpClient";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import { resetStores, membershipFixture } from "@test/utils/fixtures";

const passwordLoginMock = vi.fn();
const fetchProductsMock = vi.fn();

vi.mock("@/features/auth/api", async (importActual) => {
  const actual = await importActual<typeof import("@/features/auth/api")>();
  return {
    ...actual,
    passwordLogin: (...args: Parameters<typeof actual.passwordLogin>) =>
      passwordLoginMock(...args),
    fetchProducts: (...args: Parameters<typeof actual.fetchProducts>) =>
      fetchProductsMock(...args),
  };
});

const operatorSession = {
  accessToken: "at-operator",
  refreshToken: "rt-operator",
  user: {
    id: "operator@watchtower.local",
    email: "operator@watchtower.local",
    name: "Jamie Rivera",
    isSuperAdmin: false,
    avatarUrl: null,
  },
  memberships: [membershipFixture()],
};

function AppShell() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<div>post-login-placeholder</div>} />
    </Routes>
  );
}

describe("password login flow", () => {
  beforeEach(() => {
    resetStores();
    passwordLoginMock.mockReset();
    fetchProductsMock.mockReset();
    fetchProductsMock.mockResolvedValue([]);
  });

  it("submits operator credentials, populates auth store, and navigates to /", async () => {
    passwordLoginMock.mockResolvedValueOnce(operatorSession);
    renderWithProviders(<AppShell />, { route: "/login" });

    await userEvent.type(await screen.findByLabelText(/email/i), "operator@watchtower.local");
    await userEvent.type(screen.getByLabelText(/^password$/i), "operator");

    await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await screen.findByText("post-login-placeholder");

    const auth = useAuthStore.getState();
    expect(auth.status).toBe("authenticated");
    expect(auth.method).toBe("password");
    expect(auth.user?.email).toBe("operator@watchtower.local");
    expect(auth.accessToken).toBeTruthy();
    expect(auth.memberships.length).toBeGreaterThan(0);
  });

  it("leaves the auth store in idle state after a rejected login", async () => {
    passwordLoginMock.mockRejectedValueOnce(
      new AppError("unauthorized", "Invalid credentials", 401),
    );
    renderWithProviders(<AppShell />, { route: "/login" });

    await userEvent.type(await screen.findByLabelText(/email/i), "nobody@example.com");
    await userEvent.type(screen.getByLabelText(/^password$/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await vi.waitFor(
      () => {
        const passwordInput = screen.getByLabelText(/^password$/i);
        expect(passwordInput.getAttribute("aria-invalid")).toBe("true");
      },
      { timeout: 4000 },
    );
    expect(useAuthStore.getState().status).toBe("idle");
    expect(screen.queryByText("post-login-placeholder")).not.toBeInTheDocument();
  });
});
