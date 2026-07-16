/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_PASSWORD_ENABLED: string;
  readonly VITE_AUTH_SSO_ENABLED: string;
  readonly VITE_AUTH_MOCK: string;
  readonly VITE_SSO_AUTHORITY: string;
  readonly VITE_SSO_CLIENT_ID: string;
  readonly VITE_SSO_REDIRECT_URI: string;
  readonly VITE_SSO_POST_LOGOUT_REDIRECT_URI: string;
  readonly VITE_SSO_SCOPE: string;
  readonly VITE_ENABLE_MSW: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
