// Static hosts (S3/CloudFront) can only serve real files, so the SSO redirect
// targets `<base>/index.html`. The identity provider appends `sesame_token`
// (and/or `status`) as query params. Before the router mounts we rewrite the
// URL to the SPA route so React Router matches `/auth/callback` normally.
export function normalizeSsoCallbackLocation(): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  if (!params.has("sesame_token") && !params.has("status")) return;

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const callbackPath = `${base}/auth/callback`;
  if (window.location.pathname.endsWith("/auth/callback")) return;

  window.history.replaceState(
    null,
    "",
    `${callbackPath}?${params.toString()}${window.location.hash}`,
  );
}
