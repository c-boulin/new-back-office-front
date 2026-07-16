import { useTranslation } from "react-i18next";

export function AuthDivider() {
  const { t } = useTranslation("auth");
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-700/60" />
      <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-slate-500">
        {t("login.divider")}
      </span>
      <div className="h-px flex-1 bg-slate-700/60" />
    </div>
  );
}
