import { Outlet } from "react-router-dom";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

export function AuthLayout() {
  return (
    <div
      className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] px-4 py-10 text-foreground"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-teal-500/25 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-[-160px] h-[480px] w-[480px] rounded-full bg-sky-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.06),transparent_65%)]"
      />

      <header className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 w-full max-w-md">
        <Outlet />
      </main>
    </div>
  );
}
