import { httpClient } from "@/lib/httpClient";
import { validateAndAdapt } from "@/lib/validatorAdaptor";
import { productConfigSchema } from "./schemas";
import { productConfigFromRaw, productConfigToWriteBody } from "./adaptors";
import type { ProductConfig, ProductConfigWrite } from "./types";

export async function getProductConfig(): Promise<ProductConfig> {
  const { data } = await httpClient.get("/v1/product-config");
  return validateAndAdapt(data, productConfigSchema, productConfigFromRaw);
}

export async function saveProductConfig(body: ProductConfigWrite): Promise<ProductConfig> {
  const { data } = await httpClient.put(
    "/v1/product-config",
    productConfigToWriteBody(body),
  );
  return validateAndAdapt(data, productConfigSchema, productConfigFromRaw);
}

export async function resetProductConfig(): Promise<void> {
  await httpClient.delete("/v1/product-config");
}
