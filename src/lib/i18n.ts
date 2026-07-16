import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "@/locales/en/common.json";
import enAuth from "@/locales/en/auth.json";
import enTenants from "@/locales/en/tenants.json";
import enUsers from "@/locales/en/users.json";
import enDashboard from "@/locales/en/dashboard.json";
import enModeration from "@/locales/en/moderation.json";
import enReports from "@/locales/en/reports.json";
import enMatches from "@/locales/en/matches.json";
import enMessages from "@/locales/en/messages.json";
import enSubscriptions from "@/locales/en/subscriptions.json";
import enAnalytics from "@/locales/en/analytics.json";
import enSettings from "@/locales/en/settings.json";
import enAudit from "@/locales/en/audit.json";
import enSuperAdmin from "@/locales/en/superAdmin.json";

import frCommon from "@/locales/fr/common.json";
import frAuth from "@/locales/fr/auth.json";
import frTenants from "@/locales/fr/tenants.json";
import frUsers from "@/locales/fr/users.json";
import frDashboard from "@/locales/fr/dashboard.json";
import frModeration from "@/locales/fr/moderation.json";
import frReports from "@/locales/fr/reports.json";
import frMatches from "@/locales/fr/matches.json";
import frMessages from "@/locales/fr/messages.json";
import frSubscriptions from "@/locales/fr/subscriptions.json";
import frAnalytics from "@/locales/fr/analytics.json";
import frSettings from "@/locales/fr/settings.json";
import frAudit from "@/locales/fr/audit.json";
import frSuperAdmin from "@/locales/fr/superAdmin.json";

export const supportedLngs = ["en", "fr"] as const;
export type Locale = (typeof supportedLngs)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: [...supportedLngs],
    ns: [
      "common",
      "auth",
      "tenants",
      "users",
      "dashboard",
      "moderation",
      "reports",
      "matches",
      "messages",
      "subscriptions",
      "analytics",
      "settings",
      "audit",
      "superAdmin",
    ],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "app.locale",
    },
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        tenants: enTenants,
        users: enUsers,
        dashboard: enDashboard,
        moderation: enModeration,
        reports: enReports,
        matches: enMatches,
        messages: enMessages,
        subscriptions: enSubscriptions,
        analytics: enAnalytics,
        settings: enSettings,
        audit: enAudit,
        superAdmin: enSuperAdmin,
      },
      fr: {
        common: frCommon,
        auth: frAuth,
        tenants: frTenants,
        users: frUsers,
        dashboard: frDashboard,
        moderation: frModeration,
        reports: frReports,
        matches: frMatches,
        messages: frMessages,
        subscriptions: frSubscriptions,
        analytics: frAnalytics,
        settings: frSettings,
        audit: frAudit,
        superAdmin: frSuperAdmin,
      },
    },
  });

export default i18n;
