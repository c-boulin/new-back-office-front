import { useState } from "react";
import { RouteBoundary } from "@/components/common/RouteBoundary";
import { useProductsStore } from "@/stores/productsStore";
import { useActiveTenant } from "@/hooks/useActiveTenant";
import { ProductConfigForm } from "@/features/productConfig/components/ProductConfigForm";

export function ProductConfigPage() {
  const products = useProductsStore((s) => s.products);
  const { id: activeTenantId } = useActiveTenant();

  const initialProductId = products.length > 0 ? String(products[0].id) : activeTenantId ?? "";
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);

  return (
    <div className="space-y-6">
      <RouteBoundary>
        <ProductConfigForm
          key={selectedProductId}
          selectedProductId={selectedProductId}
          onSelectProduct={setSelectedProductId}
        />
      </RouteBoundary>
    </div>
  );
}
