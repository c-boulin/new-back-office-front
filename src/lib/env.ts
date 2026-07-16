const passwordEnabled = import.meta.env.VITE_AUTH_PASSWORD_ENABLED === "true";
const ssoEnabled = import.meta.env.VITE_AUTH_SSO_ENABLED === "true";

if (!passwordEnabled && !ssoEnabled) {
  throw new Error(
    "[env] At least one auth method must be enabled: set VITE_AUTH_PASSWORD_ENABLED or VITE_AUTH_SSO_ENABLED to \"true\".",
  );
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  sso: {
    authority: import.meta.env.VITE_SSO_AUTHORITY as string,
    clientId: import.meta.env.VITE_SSO_CLIENT_ID as string,
    redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI as string,
    postLogoutRedirectUri: import.meta.env.VITE_SSO_POST_LOGOUT_REDIRECT_URI as string,
    scope: import.meta.env.VITE_SSO_SCOPE as string,
  },
  auth: {
    passwordEnabled,
    ssoEnabled,
    mocked: import.meta.env.VITE_AUTH_MOCK === "true",
  },
  flags: {
    enableMsw: import.meta.env.VITE_ENABLE_MSW === "true",
  },
} as const;
