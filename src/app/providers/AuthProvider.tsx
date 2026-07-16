import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { oidcClient } from "@/lib/oidcClient";

/**
 * Boots the OIDC session on app mount and keeps auth store in sync with
 * cross-tab logouts / silent renewals via storage + oidc events.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setSession = useAuthStore((s) => s.setSession);
  const markExpired = useAuthStore((s) => s.markSessionExpired);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const user = await oidcClient.getUser();
        if (cancelled) return;
        if (user && !user.expired) {
          setSession({
            accessToken: user.access_token,
            idToken: user.id_token ?? null,
            expiresAt: user.expires_at ?? null,
          });
        }
      } catch (error) {
        console.error("[AuthProvider] getUser failed", error);
      }
    })();

    const onUserLoaded = (user: import("oidc-client-ts").User) => {
      setSession({
        accessToken: user.access_token,
        idToken: user.id_token ?? null,
        expiresAt: user.expires_at ?? null,
      });
    };
    const onUserUnloaded = () => clear();
    const onExpired = () => markExpired();

    oidcClient.events.addUserLoaded(onUserLoaded);
    oidcClient.events.addUserUnloaded(onUserUnloaded);
    oidcClient.events.addAccessTokenExpired(onExpired);
    oidcClient.events.addSilentRenewError(onExpired);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth.session" && e.newValue === null) clear();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      oidcClient.events.removeUserLoaded(onUserLoaded);
      oidcClient.events.removeUserUnloaded(onUserUnloaded);
      oidcClient.events.removeAccessTokenExpired(onExpired);
      oidcClient.events.removeSilentRenewError(onExpired);
      window.removeEventListener("storage", onStorage);
    };
  }, [setSession, markExpired, clear]);

  return <>{children}</>;
}
