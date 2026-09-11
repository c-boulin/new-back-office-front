import { useTranslation } from "react-i18next";

export function AuthDivider() {
  const { t } = useTranslation("auth");
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className="h-px flex-1 bg-border" />
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {t("login.divider")}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
