import { useTranslation } from "react-i18next";
import { Settings2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/auth/products";

export type ProductConfigHeaderProps = {
  products: Product[];
  selectedProductId: string;
  onSelectProduct: (id: string) => void;
  selectedProduct: Product | null;
  isDirty: boolean;
  isSaving: boolean;
  onReset: () => void;
  onSave: () => void;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProductConfigHeader({
  products,
  selectedProductId,
  onSelectProduct,
  selectedProduct,
  isDirty,
  isSaving,
  onReset,
  onSave,
}: ProductConfigHeaderProps) {
  const { t } = useTranslation("productConfig");
  const { t: tCommon } = useTranslation("common");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {products.map((p) => {
          const isSelected = String(p.id) === selectedProductId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProduct(String(p.id))}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors",
                isSelected
                  ? "border-primary font-semibold text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: `hsl(${p.hue})` }}
              />
              {p.name}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 rounded-lg bg-muted/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary">
              {selectedProduct ? initials(selectedProduct.name) : "?"}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <span className="font-medium text-foreground">
              {selectedProduct?.name ?? tCommon("common.loading")}
            </span>
            <span className="ml-2 text-muted-foreground">
              {t("summary.productId")}: {selectedProductId}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={!isDirty || isSaving}
          >
            <RotateCcw className="h-4 w-4" />
            {t("summary.reset")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            disabled={!isDirty || isSaving}
          >
            <Save className="h-4 w-4" />
            {t("summary.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
