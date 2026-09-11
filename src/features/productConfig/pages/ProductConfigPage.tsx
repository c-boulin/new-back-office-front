import { RouteBoundary } from "@/components/common/RouteBoundary";
import { ProductConfigForm } from "@/features/productConfig/components/ProductConfigForm";

export function ProductConfigPage() {
  return (
    <div className="space-y-6">
      <RouteBoundary>
        <ProductConfigForm />
      </RouteBoundary>
    </div>
  );
}
