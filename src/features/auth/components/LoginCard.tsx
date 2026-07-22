import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { env } from "@/lib/env";
import { AuthBrandHeader } from "./AuthBrandHeader";
import { ProductPicker } from "./ProductPicker";
import { PasswordLoginForm } from "./PasswordLoginForm";
import { AuthDivider } from "./AuthDivider";
import { MicrosoftSsoButton } from "./MicrosoftSsoButton";
import { PRODUCT_CATALOG, type CatalogProduct } from "./product-catalog";

export function LoginCard() {
  const { t } = useTranslation("auth");
  const { passwordEnabled, ssoEnabled } = env.auth;
  const [selected, setSelected] = useState<CatalogProduct>(PRODUCT_CATALOG[0]);

  const showBoth = passwordEnabled && ssoEnabled;
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <div className="w-full max-w-md">
      <AuthBrandHeader />

      <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
        <ProductPicker value={selected} onChange={setSelected} />

        {ssoEnabled ? <MicrosoftSsoButton /> : null}

        {showBoth ? <AuthDivider /> : null}

        {passwordEnabled ? <PasswordLoginForm productName={selected.name} /> : null}
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("layout.footer", { year })}
      </p>
    </div>
  );
}
