import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { AuthUser, TenantMembership } from "@/features/auth/types";

export type AuthMethod = "sso" | "password";

type SessionPayload = {
  accessToken: string | null;
  refreshToken?: string | null;
  method: AuthMethod;
};

type AuthState = {
  status: "idle" | "authenticating" | "authenticated" | "expired" | "unauthenticated";
  method: AuthMethod | null;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  memberships: TenantMembership[];
  setSession: (payload: SessionPayload) => void;
  updateAccessToken: (token: string) => void;
  setUser: (user: AuthUser, memberships: TenantMembership[]) => void;
  markAuthenticating: () => void;
  markSessionExpired: () => void;
  resetToIdle: () => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      status: "idle",
      method: null,
      user: null,
      accessToken: null,
      refreshToken: null,
      memberships: [],
      setSession: (payload) =>
        set((state) => {
          state.accessToken = payload.accessToken;
          if (payload.refreshToken !== undefined) {
            state.refreshToken = payload.refreshToken;
          }
          state.method = payload.method;
          if (payload.accessToken) state.status = "authenticated";
        }),
      updateAccessToken: (token) =>
        set((state) => {
          state.accessToken = token;
          state.status = "authenticated";
        }),
      setUser: (user, memberships) =>
        set((state) => {
          state.user = user;
          state.memberships = memberships;
          state.status = "authenticated";
        }),
      markAuthenticating: () =>
        set((state) => {
          state.status = "authenticating";
        }),
      markSessionExpired: () =>
        set((state) => {
          state.status = "expired";
          state.accessToken = null;
        }),
      resetToIdle: () =>
        set((state) => {
          state.status = "idle";
        }),
      clear: () =>
        set((state) => {
          state.status = "unauthenticated";
          state.method = null;
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.memberships = [];
        }),
    })),
    {
      name: "auth.session",
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
        method: state.method,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
