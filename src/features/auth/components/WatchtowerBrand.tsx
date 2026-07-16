import { useTranslation } from "react-i18next";
import { Lightbulb } from "lucide-react";

export function WatchtowerBrand() {
  const { t } = useTranslation("auth");
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400/20 to-teal-500/5 ring-1 ring-teal-400/30">
        <div className="absolute inset-0 rounded-full bg-teal-400/10 blur-md" />
        <Lightbulb className="relative h-7 w-7 text-teal-300" strokeWidth={1.5} />
      </div>
      <div className="space-y-2">
        <h1 className="bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-3xl font-semibold uppercase tracking-[0.35em] text-transparent">
          {t("login.brand")}
        </h1>
        <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-teal-400/70 to-transparent" />
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          {t("login.tagline")}
        </p>
      </div>
    </div>
  );
}
