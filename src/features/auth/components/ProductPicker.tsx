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
        className="grid grid-cols-3 gap-2"
      >
        {products.map((product) => {
          const active = value?.id === product.id;
          return (
            <button
              key={product.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(product)}
              className={cn(
                "group flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                active
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
                disabled && "opacity-60",
              )}
            >
              <span
                aria-hidden
                className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white shadow"
                style={{
                  background: `linear-gradient(135deg, hsl(${product.hue}) 0%, hsl(${product.accent}) 100%)`,
                }}
              >
                {active ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
              </span>
              <span className="min-w-0 truncate text-sm font-medium text-foreground">
                {product.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
