export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  sso: {
    authority: import.meta.env.VITE_SSO_AUTHORITY as string,
    clientId: import.meta.env.VITE_SSO_CLIENT_ID as string,
    redirectUri: import.meta.env.VITE_SSO_REDIRECT_URI as string,
    postLogoutRedirectUri: import.meta.env.VITE_SSO_POST_LOGOUT_REDIRECT_URI as string,
    scope: import.meta.env.VITE_SSO_SCOPE as string,
  },
  flags: {
    enableMsw: import.meta.env.VITE_ENABLE_MSW === "true",
  },
} as const;
