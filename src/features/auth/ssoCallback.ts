export function getSsoCallbackUrl(): string {
  return `${window.location.origin}/auth/callback`;
}
