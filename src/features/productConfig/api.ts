import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { productConfigSchema } from "./schemas";
import { productConfigFromRaw, productConfigToRaw } from "./adaptors";
import type { ProductConfig, ProductConfigWrite } from "./types";

export async function getProductConfig(productId: string): Promise<ProductConfig> {
  const { data } = await httpClient.get("/v1/product-config", {
    params: { product_id: productId },
  });
  return validateAndAdapt(data, productConfigSchema, productConfigFromRaw);
}

export async function saveProductConfig(
  productId: string,
  body: ProductConfigWrite,
): Promise<ProductConfig> {
  const { data } = await httpClient.patch("/v1/product-config", {
    ...productConfigToRaw(body),
    product_id: productId,
  });
  return validateAndAdapt(data, productConfigSchema, productConfigFromRaw);
}
