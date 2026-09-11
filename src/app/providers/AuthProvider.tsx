import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "auth.session" && e.newValue === null) clear();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [clear]);

  return <>{children}</>;
}
