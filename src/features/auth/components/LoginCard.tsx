import { useTranslation } from "react-i18next";
import { env } from "@/lib/env";
import { WatchtowerBrand } from "./WatchtowerBrand";
import { PasswordLoginForm } from "./PasswordLoginForm";
import { AuthDivider } from "./AuthDivider";
import { SsoLoginButton } from "./SsoLoginButton";

export function LoginCard() {
  const { t } = useTranslation("auth");
  const { passwordEnabled, ssoEnabled } = env.auth;
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

          <p className="text-center text-[11px] text-slate-500">{t("login.help")}</p>
        </div>
      </section>
    </div>
  );
}
