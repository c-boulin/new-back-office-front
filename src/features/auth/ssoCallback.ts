const SSO_PRODUCT_ID_KEY = "auth.sso.productId";

export function getSsoCallbackUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${window.location.origin}${base}/index.html`;
}

export function saveSsoProductId(productId: number): void {
  try {
    sessionStorage.setItem(SSO_PRODUCT_ID_KEY, String(productId));
  } catch {
    // storage disabled — fallback path in callback will use env.defaultProductId.
  }
}

export function consumeSsoProductId(): number | null {
  try {
    const raw = sessionStorage.getItem(SSO_PRODUCT_ID_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(SSO_PRODUCT_ID_KEY);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && Number.isInteger(parsed) && parsed > 0
      ? parsed
      : null;
  } catch {
    return null;
  }
}
