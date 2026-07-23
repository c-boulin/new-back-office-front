import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import { AuthLayout } from "./layouts/AuthLayout";
import { TenantLayout } from "./layouts/TenantLayout";
import { SuperAdminLayout } from "./layouts/SuperAdminLayout";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireSuperAdmin } from "./guards/RequireSuperAdmin";
import { RequireTenant } from "./guards/RequireTenant";
import { RouteErrorFallback } from "@/components/common/RouteErrorFallback";
import { normalizeSsoCallbackLocation } from "@/features/auth/ssoBootRedirect";

// Must run before createBrowserRouter reads window.location, otherwise an
// S3 SSO return on .../index.html?sesame_token=... never matches /auth/callback.
normalizeSsoCallbackLocation();

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const CallbackPage = lazy(() =>
  import("@/features/auth/pages/CallbackPage").then((m) => ({ default: m.CallbackPage })),
);
const AccessDeniedPage = lazy(() =>
  import("@/features/auth/pages/AccessDeniedPage").then((m) => ({ default: m.AccessDeniedPage })),
);
const PostLoginRouter = lazy(() =>
  import("@/features/auth/pages/PostLoginRouter").then((m) => ({ default: m.PostLoginRouter })),
);
const TenantChooserPage = lazy(() =>
  import("@/features/tenants/pages/TenantChooserPage").then((m) => ({
    default: m.TenantChooserPage,
  })),
);
const TenantDashboardPage = lazy(() =>
  import("@/features/dashboard/pages/TenantDashboardPage").then((m) => ({
    default: m.TenantDashboardPage,
  })),
);
const UsersListPage = lazy(() =>
  import("@/features/users/pages/UsersListPage").then((m) => ({ default: m.UsersListPage })),
);
const ModerationPage = lazy(() =>
  import("@/features/moderation/pages/ModerationPage").then((m) => ({ default: m.ModerationPage })),
);
const ReportsPage = lazy(() =>
  import("@/features/reports/pages/ReportsPage").then((m) => ({ default: m.ReportsPage })),
);
const MatchesPage = lazy(() =>
  import("@/features/matches/pages/MatchesPage").then((m) => ({ default: m.MatchesPage })),
);
const MessagesPage = lazy(() =>
  import("@/features/messages/pages/MessagesPage").then((m) => ({ default: m.MessagesPage })),
);
const SubscriptionsPage = lazy(() =>
  import("@/features/subscriptions/pages/SubscriptionsPage").then((m) => ({
    default: m.SubscriptionsPage,
  })),
);
const AnalyticsPage = lazy(() =>
  import("@/features/analytics/pages/AnalyticsPage").then((m) => ({ default: m.AnalyticsPage })),
);
const SettingsPage = lazy(() =>
  import("@/features/settings/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);
const TenantsListPage = lazy(() =>
  import("@/features/superAdmin/pages/TenantsListPage").then((m) => ({
    default: m.TenantsListPage,
  })),
);
const SuperAdminDashboardPage = lazy(() =>
  import("@/features/superAdmin/pages/SuperAdminDashboardPage").then((m) => ({
    default: m.SuperAdminDashboardPage,
  })),
);
const PlatformAdminsPage = lazy(() =>
  import("@/features/superAdmin/pages/PlatformAdminsPage").then((m) => ({
    default: m.PlatformAdminsPage,
  })),
);
const AnimatorsPage = lazy(() =>
  import("@/features/animators/pages/AnimatorsPage").then((m) => ({ default: m.AnimatorsPage })),
);
const CoachesPage = lazy(() =>
  import("@/features/coaches/pages/CoachesPage").then((m) => ({ default: m.CoachesPage })),
);
const CoachAiPage = lazy(() =>
  import("@/features/coachAi/pages/CoachAiPage").then((m) => ({ default: m.CoachAiPage })),
);
const ProductConfigPage = lazy(() =>
  import("@/features/productConfig/pages/ProductConfigPage").then((m) => ({
    default: m.ProductConfigPage,
  })),
);
const PermissionsPage = lazy(() =>
  import("@/features/permissions/pages/PermissionsPage").then((m) => ({
    default: m.PermissionsPage,
  })),
);

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, "");

export const router = createBrowserRouter(
  [
    {
      element: <AuthLayout />,
      errorElement: <RouteErrorFallback />,
      children: [
        { path: "/login", element: <LoginPage /> },
        { path: "/auth/callback", element: <CallbackPage /> },
      ],
    },
    { path: "/access-denied", element: <AccessDeniedPage /> },
    {
      element: <RequireAuth />,
      children: [
        { path: "/", element: <PostLoginRouter /> },
        { path: "/tenants", element: <TenantChooserPage /> },
        {
          path: "/admin",
          element: <RequireSuperAdmin />,
          children: [
            {
              element: <SuperAdminLayout />,
              errorElement: <RouteErrorFallback />,
              children: [
                { index: true, element: <SuperAdminDashboardPage /> },
                { path: "tenants", element: <TenantsListPage /> },
                { path: "admins", element: <PlatformAdminsPage /> },
              ],
            },
          ],
        },
        {
          path: "/t/:tenantSlug",
          element: <RequireTenant />,
          children: [
            {
              element: <TenantLayout />,
              errorElement: <RouteErrorFallback />,
              children: [
                { index: true, element: <TenantDashboardPage /> },
                { path: "users", element: <UsersListPage /> },
                { path: "moderation", element: <ModerationPage /> },
                { path: "reports", element: <ReportsPage /> },
                { path: "matches", element: <MatchesPage /> },
                { path: "messages", element: <MessagesPage /> },
                { path: "subscriptions", element: <SubscriptionsPage /> },
                { path: "analytics", element: <AnalyticsPage /> },
                { path: "settings", element: <SettingsPage /> },
                { path: "animators", element: <AnimatorsPage /> },
                { path: "coaches", element: <CoachesPage /> },
                { path: "coach-ai", element: <CoachAiPage /> },
                { path: "product-config", element: <ProductConfigPage /> },
                { path: "permissions", element: <PermissionsPage /> },
              ],
            },
          ],
        },
      ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
  ],
  { basename: routerBasename },
);
