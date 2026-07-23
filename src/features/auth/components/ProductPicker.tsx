import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { Product } from "../products";

export type ProductPickerProps = {
  products: readonly Product[];
  value: Product | null;
  onChange: (product: Product) => void;
  disabled?: boolean;
};

export function ProductPicker({ products, value, onChange, disabled }: ProductPickerProps) {
  const { t } = useTranslation("auth");

  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {t("login.chooseProduct")}
      </p>
      <div
        role="radiogroup"
        aria-label={t("login.chooseProduct")}
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        {products.map((product) => {
          const active = value?.id === product.id;
          const gradient = `linear-gradient(135deg, hsl(${product.hue}) 0%, hsl(${product.accent}) 100%)`;
          return (
            <button
              key={product.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(product)}
              style={
                active
                  ? {
                      borderColor: `hsl(${product.hue})`,
                      boxShadow: `0 0 0 3px hsl(${product.hue} / 0.18)`,
                    }
                  : undefined
              }
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 bg-card px-3 py-2.5 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active ? "shadow-sm" : "border-border hover:bg-muted/40",
                disabled && "opacity-60",
              )}
            >
              <span
                aria-hidden
                className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-black/5"
                style={{ background: gradient }}
              >
                {active ? <Check className="h-5 w-5" strokeWidth={3} /> : null}
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block break-words text-sm font-semibold text-foreground">
                  {product.name}
                </span>
                {product.color ? (
                  <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {product.color}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
