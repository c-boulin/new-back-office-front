/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTH_PASSWORD_ENABLED: string;
  readonly VITE_AUTH_SSO_ENABLED: string;
  readonly VITE_AUTH_SSO_REAL: string;
  readonly VITE_DEFAULT_PRODUCT_ID: string;
  readonly VITE_MOCK_API: string;
  readonly VITE_MOCK_PERSIST: string;
  readonly VITE_ENABLE_MSW: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
