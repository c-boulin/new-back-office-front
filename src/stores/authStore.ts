import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { AuthUser, TenantMembership } from "@/features/auth/types";

type SessionPayload = {
  accessToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
};

type AuthState = {
  status: "idle" | "authenticating" | "authenticated" | "expired" | "unauthenticated";
  user: AuthUser | null;
  accessToken: string | null;
  idToken: string | null;
  expiresAt: number | null;
  memberships: TenantMembership[];
  setSession: (payload: SessionPayload) => void;
  setUser: (user: AuthUser, memberships: TenantMembership[]) => void;
  markAuthenticating: () => void;
  markSessionExpired: () => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set) => ({
      status: "idle",
      user: null,
      accessToken: null,
      idToken: null,
      expiresAt: null,
      memberships: [],
      setSession: (payload) =>
        set((state) => {
          state.accessToken = payload.accessToken;
          state.idToken = payload.idToken;
          state.expiresAt = payload.expiresAt;
          if (payload.accessToken) state.status = "authenticated";
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
      clear: () =>
        set((state) => {
          state.status = "unauthenticated";
          state.user = null;
          state.accessToken = null;
          state.idToken = null;
          state.expiresAt = null;
          state.memberships = [];
        }),
    })),
    {
      name: "auth.session",
      partialize: (state) => ({
        user: state.user,
        memberships: state.memberships,
      }),
    },
  ),
);
