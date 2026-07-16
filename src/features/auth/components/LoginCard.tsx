import { useTranslation } from "react-i18next";
import { env } from "@/lib/env";
import { WatchtowerBrand } from "./WatchtowerBrand";
import { PasswordLoginForm } from "./PasswordLoginForm";
import { AuthDivider } from "./AuthDivider";
import { SsoLoginButton } from "./SsoLoginButton";

export function LoginCard() {
  const { t } = useTranslation("auth");
  const { passwordEnabled, ssoEnabled, mocked } = env.auth;
  const showBoth = passwordEnabled && ssoEnabled;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-px rounded-2xl bg-gradient-to-b from-teal-400/25 via-slate-800/0 to-slate-800/0 blur-sm"
      />
      <section className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-8 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <WatchtowerBrand />

        <div className="mt-8 space-y-6">
          {passwordEnabled ? <PasswordLoginForm /> : null}

          {showBoth ? <AuthDivider /> : null}

          {ssoEnabled ? <SsoLoginButton /> : null}

          {mocked && passwordEnabled ? (
            <p className="rounded-md border border-teal-400/20 bg-teal-400/5 px-3 py-2 text-[11px] leading-relaxed text-teal-200/80">
              {t("login.mockHint")}
            </p>
          ) : null}

          <p className="text-center text-[11px] text-slate-500">{t("login.help")}</p>
        </div>
      </section>
    </div>
  );
}
