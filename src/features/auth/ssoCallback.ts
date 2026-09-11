// Static hosts (S3/CloudFront) can only serve real files, so the SSO redirect
// targets `<base>/index.html`. The identity provider appends `sesame_token`
// (and/or `status`) as query params. Before the router mounts we rewrite the
// URL to the SPA route so React Router matches `/auth/callback` normally.
export function getSsoCallbackUrl(): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${window.location.origin}${base}/index.html`;
}
