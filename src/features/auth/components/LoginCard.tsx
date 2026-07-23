import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Loader as Loader2 } from "lucide-react";
import { env } from "@/lib/env";
import { fetchProducts } from "../api";
import { AuthBrandHeader } from "./AuthBrandHeader";
import { ProductPicker } from "./ProductPicker";
import { PasswordLoginForm } from "./PasswordLoginForm";
import { AuthDivider } from "./AuthDivider";
import { MicrosoftSsoButton } from "./MicrosoftSsoButton";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import type { Product } from "../products";

function pickInitialProduct(products: readonly Product[]): Product | null {
  if (products.length === 0) return null;
  return (
    products.find((p) => p.id === env.defaultProductId) ?? products[0]
  );
}

export function LoginCard() {
  const { t } = useTranslation("auth");
  const { passwordEnabled, ssoEnabled } = env.auth;
  const showBoth = passwordEnabled && ssoEnabled;
  const year = useMemo(() => new Date().getFullYear(), []);

  const productsQuery = useQuery({
    queryKey: ["auth", "products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60_000,
  });

  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    if (!productsQuery.data) return;
    setSelected((current) => {
      if (current && productsQuery.data.some((p) => p.id === current.id)) {
        return current;
      }
      return pickInitialProduct(productsQuery.data);
    });
  }, [productsQuery.data]);

  return (
    <div className="w-full max-w-md">
      <AuthBrandHeader />

      <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
        {productsQuery.isLoading ? (
          <div
            className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground"
            role="status"
            aria-live="polite"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {t("products.loading")}
          </div>
        ) : productsQuery.isError ? (
          <div className="space-y-3 py-2 text-center">
            <p className="text-sm text-destructive">{t("products.error")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void productsQuery.refetch()}
            >
              {t("products.retry")}
            </Button>
          </div>
        ) : productsQuery.data && productsQuery.data.length === 0 ? (
          <EmptyState
            title={t("products.emptyTitle")}
            description={t("products.emptyDescription")}
          />
        ) : productsQuery.data && selected ? (
          <>
            <ProductPicker
              products={productsQuery.data}
              value={selected}
              onChange={setSelected}
            />

            {ssoEnabled ? <MicrosoftSsoButton productId={selected.id} /> : null}

            {showBoth ? <AuthDivider /> : null}

            {passwordEnabled ? <PasswordLoginForm productId={selected.id} /> : null}
          </>
        ) : null}
      </section>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("layout.footer", { year })}
      </p>
    </div>
  );
}
