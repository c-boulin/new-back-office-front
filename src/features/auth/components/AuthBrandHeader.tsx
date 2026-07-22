import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AuthBrandHeader() {
  const { t } = useTranslation("auth");
  return (
    <div className="mb-8 flex flex-col items-center gap-4 text-center">
      <div
        aria-hidden
        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
      >
        <Heart className="h-7 w-7" strokeWidth={2} />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t("login.brand")}
        </h1>
        <p className="text-sm text-muted-foreground">{t("login.tagline")}</p>
      </div>
    </div>
  );
}
