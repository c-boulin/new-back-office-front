import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { Heart } from "lucide-react";

export function AuthLayout() {
  const { t } = useTranslation("auth");
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <header className="absolute right-4 top-4 z-10">
        <LanguageSwitcher />
      </header>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Heart className="h-5 w-5" aria-hidden />
            </span>
            <span>{t("login.brand")}</span>
          </div>
          <Outlet />
        </div>
      </div>

      <div
        className="hidden bg-gradient-to-br from-primary/90 to-accent lg:block"
        aria-hidden
      >
        <div className="flex h-full items-end p-10 text-primary-foreground">
          <blockquote className="max-w-md text-lg font-medium leading-relaxed">
            "Every match starts with people who feel safe. We keep that promise."
            <footer className="mt-3 text-sm font-normal opacity-80">
              — Trust &amp; Safety team
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
