import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { useAuthStore } from "@/stores/authStore";
import { renderWithProviders } from "@test/utils/renderWithProviders";
import { resetStores } from "@test/utils/fixtures";

function AppShell() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/post-login" element={<div>post-login-placeholder</div>} />
    </Routes>
  );
}

describe("password login flow", () => {
  beforeEach(() => {
    resetStores();
  });

  it("submits operator credentials, populates auth store, and navigates to /post-login", async () => {
    renderWithProviders(<AppShell />, { route: "/login" });

    await userEvent.type(screen.getByLabelText(/username/i), "operator");
    await userEvent.type(screen.getByLabelText(/^password$/i), "operator");

    await userEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await screen.findByText("post-login-placeholder");

    const auth = useAuthStore.getState();
    expect(auth.status).toBe("authenticated");
    expect(auth.method).toBe("password");
    expect(auth.user?.email).toContain("@");
    expect(auth.accessToken).toBeTruthy();
    expect(auth.memberships.length).toBeGreaterThan(0);
  });

  it("leaves the auth store in idle state after a rejected login", async () => {
    renderWithProviders(<AppShell />, { route: "/login" });

    await userEvent.type(screen.getByLabelText(/username/i), "nobody");
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
