import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import enAuth from "@/locales/en/auth.json";
import enTenants from "@/locales/en/tenants.json";
import enUsers from "@/locales/en/users.json";
import frCommon from "@/locales/fr/common.json";
import frAuth from "@/locales/fr/auth.json";
import frTenants from "@/locales/fr/tenants.json";
import frUsers from "@/locales/fr/users.json";

export const supportedLngs = ["en", "fr"] as const;
export type Locale = (typeof supportedLngs)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: [...supportedLngs],
    ns: ["common", "auth", "tenants", "users"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "app.locale",
    },
    resources: {
      en: { common: enCommon, auth: enAuth, tenants: enTenants, users: enUsers },
      fr: { common: frCommon, auth: frAuth, tenants: frTenants, users: frUsers },
    },
  });

export default i18n;
