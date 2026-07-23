const SELECTED_PRODUCT_ID_KEY = "auth.selectedProductId";

export function getSsoCallbackUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${window.location.origin}${base}/index.html`;
}

export function saveSelectedProductId(productId: number): void {
  try {
    sessionStorage.setItem(SELECTED_PRODUCT_ID_KEY, String(productId));
  } catch {
    // storage disabled — the caller falls back to env.defaultProductId.
  }
}

function parseStored(raw: string | null): number | null {
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && Number.isInteger(parsed) && parsed > 0
    ? parsed
    : null;
}

export function readSelectedProductId(): number | null {
  try {
    return parseStored(sessionStorage.getItem(SELECTED_PRODUCT_ID_KEY));
  } catch {
    return null;
  }
}

export function consumeSelectedProductId(): number | null {
  try {
    const value = parseStored(sessionStorage.getItem(SELECTED_PRODUCT_ID_KEY));
    sessionStorage.removeItem(SELECTED_PRODUCT_ID_KEY);
    return value;
  } catch {
    return null;
  }
}
