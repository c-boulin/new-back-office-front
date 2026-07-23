import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AuthBrandHeader } from "./AuthBrandHeader";
import { ProductPicker } from "./ProductPicker";
import { membershipToProduct } from "../products";
import type { Product } from "../products";
import type { TenantMembership } from "@/features/auth/types";
import { useTenantStore } from "@/stores/tenantStore";
import { applyBrandThemeForTenant } from "@/lib/tenantTheme";

export type PostLoginProductPickerProps = {
  memberships: TenantMembership[];
};

export function PostLoginProductPicker({ memberships }: PostLoginProductPickerProps) {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const products: Product[] = memberships.map(membershipToProduct);
  const [selected, setSelected] = useState<Product>(products[0]);

  useEffect(() => {
    setSelected((prev) => products.find((p) => p.id === prev.id) ?? products[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberships]);

  const onContinue = () => {
    const membership = memberships.find((m) => Number(m.tenantId) === selected.id);
    if (!membership) return;
    setActiveTenant({
      id: membership.tenantId,
      slug: membership.tenantSlug,
      theme: membership.theme,
    });
    applyBrandThemeForTenant(membership.tenantId, membership.tenantSlug);
    navigate(`/t/${membership.tenantSlug}`, { replace: true });
  };

  return (
    <div className="w-full max-w-md">
      <AuthBrandHeader />

      <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
        <div className="space-y-1.5 text-center">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t("productSelect.title")}
          </h2>
          <p className="text-xs text-muted-foreground">{t("productSelect.description")}</p>
        </div>

        <ProductPicker products={products} value={selected} onChange={setSelected} />

        <Button
          type="button"
          size="lg"
          onClick={onContinue}
          className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          {t("productSelect.continue")}
        </Button>
      </section>
    </div>
  );
}
