import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { SkipLink } from "@/components/common/SkipLink";
import { useDefaultTheme } from "@/hooks/useDefaultTheme";

export function AuthLayout() {
  useDefaultTheme();
  const { t } = useTranslation("common");
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-10 text-foreground">
      <SkipLink label={t("skipToContent")} targetId="auth-main" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full bg-primary/5 blur-3xl"
      />

      <header className="absolute right-4 top-4 z-10 flex items-center gap-1">
        <ThemeToggle />
        <LanguageSwitcher />
      </header>

      <main id="auth-main" className="relative z-10 w-full max-w-md">
        <Outlet />
      </main>
    </div>
  );
}
