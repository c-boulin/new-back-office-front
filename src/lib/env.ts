const FALLBACK_API_BASE_URL = [
  "https:",
  "",
  "876avtwsc1.execute-api.eu-west-1.amazonaws.com/dev/api",
].join("/");
const FALLBACK_PRODUCT_ID = 69;

function readString(key: keyof ImportMetaEnv, fallback: string): string {
  const raw = import.meta.env[key];
  if (typeof raw === "string" && raw.length > 0) return raw;
  if (import.meta.env.DEV) {
    console.warn("[env] " + key + " missing, using fallback: " + fallback);
  }
  return fallback;
}

function readBool(key: keyof ImportMetaEnv, fallback: boolean): boolean {
  const raw = import.meta.env[key];
  if (raw === "true") return true;
  if (raw === "false") return false;
  return fallback;
}

function readProductId(): number {
  const raw = import.meta.env.VITE_DEFAULT_PRODUCT_ID;
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }
  if (import.meta.env.DEV) {
    console.warn(
      "[env] VITE_DEFAULT_PRODUCT_ID missing or invalid, using fallback: " +
        FALLBACK_PRODUCT_ID,
    );
  }
  return FALLBACK_PRODUCT_ID;
}

const passwordEnabled = readBool("VITE_AUTH_PASSWORD_ENABLED", true);
const ssoEnabled = readBool("VITE_AUTH_SSO_ENABLED", true);

if (!passwordEnabled && !ssoEnabled) {
  throw new Error(
    "[env] At least one auth method must be enabled: set VITE_AUTH_PASSWORD_ENABLED or VITE_AUTH_SSO_ENABLED to true.",
  );
}

export const env = {
  apiBaseUrl: readString("VITE_API_BASE_URL", FALLBACK_API_BASE_URL),
  defaultProductId: readProductId(),
  auth: {
    passwordEnabled,
    ssoEnabled,
    ssoBypassMock: readBool("VITE_AUTH_SSO_REAL", false),
  },
  mock: {
    api: readBool("VITE_MOCK_API", false),
    persist: readBool("VITE_MOCK_PERSIST", false),
  },
  flags: {
    enableMsw: readBool("VITE_ENABLE_MSW", false),
  },
} as const;
