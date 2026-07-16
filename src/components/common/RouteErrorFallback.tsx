import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ErrorState } from "./ErrorState";

export function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : t("errors.description");

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center p-6">
      <ErrorState
        title={t("errors.routeTitle", { defaultValue: "Something went wrong" })}
        description={message}
        onRetry={() => {
          // Re-fetch the failed chunk by reloading the current route.
          navigate(0);
        }}
      />
    </div>
  );
}
