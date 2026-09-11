import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { AuthBrandHeader } from "./AuthBrandHeader";
import { ProductPicker } from "./ProductPicker";
import { membershipToProduct } from "../products";
import type { Product } from "../products";
import { fetchProducts } from "../api";
import type { TenantMembership } from "@/features/auth/types";
import { useTenantStore } from "@/stores/tenantStore";
import { useProductsStore } from "@/stores/productsStore";
import { applyBrandThemeForTenant } from "@/lib/tenantTheme";

export type PostLoginProductPickerProps = {
  memberships: TenantMembership[];
};

function enrich(memberships: TenantMembership[], catalog: Product[]): Product[] {
  return memberships.map((m) => {
    const derived = membershipToProduct(m);
    const bySlug = catalog.find((p) => p.slug && p.slug === m.tenantSlug);
    const byId = catalog.find((p) => String(p.id) === m.tenantId);
    const match = bySlug ?? byId;
    if (!match) return derived;
    return {
      ...derived,
      color: match.color,
      hue: match.hue,
      accent: match.accent,
    };
  });
}

function PostLoginProductPicker({ memberships }: PostLoginProductPickerProps) {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const setActiveTenant = useTenantStore((s) => s.setActiveTenant);
  const setProducts = useProductsStore((s) => s.setProducts);

  const { data: catalog } = useQuery({
    queryKey: ["auth", "products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (catalog && catalog.length > 0) setProducts(catalog);
  }, [catalog, setProducts]);

  const products = useMemo(
    () => enrich(memberships, catalog ?? []),
    [memberships, catalog],
  );

  const [selected, setSelected] = useState<Product>(products[0]);

  useEffect(() => {
    setSelected((prev) => products.find((p) => p.id === prev.id) ?? products[0]);
  }, [products]);

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 px-4 py-10 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.14),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[480px] w-[480px] rounded-full bg-primary/5 blur-3xl"
      />

      <main className="relative z-10 w-full max-w-md">
        <AuthBrandHeader />

        <section className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-black/5 sm:p-8">
          <div className="space-y-1.5 text-center">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {t("productSelect.title")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("productSelect.description")}
            </p>
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
      </main>
    </div>
  );
}

export { PostLoginProductPicker };
