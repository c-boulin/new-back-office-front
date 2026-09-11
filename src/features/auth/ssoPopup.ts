export const SSO_POPUP_MESSAGE_TYPE = "sso:callback" as const;
const SSO_POPUP_NAME = "watchtower-sso" as const;

export type SsoPopupSuccess = {
  type: typeof SSO_POPUP_MESSAGE_TYPE;
  status: "ok";
  sesameToken: string;
};

export type SsoPopupFailure = {
  type: typeof SSO_POPUP_MESSAGE_TYPE;
  status: "ko";
  reason: string | null;
};

export type SsoPopupMessage = SsoPopupSuccess | SsoPopupFailure;

/**
 * True when the current window was opened by another same-origin window that is
 * still around to receive a postMessage — i.e. we are running inside the SSO
 * popup and can hand the sesame_token back to the opener.
 */
function isPopupContext(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.opener != null && window.opener !== window && !window.opener.closed;
  } catch {
    return false;
  }
}

/**
 * When the SSO provider bounces back to our app, the callback URL carries the
 * `sesame_token` (or a `status=ko` on failure). If we are inside a popup, forward
 * that payload to the opener and close ourselves — the opener finishes the login
 * in-place, so the top-level app never loses its React/Query state.
 *
 * Returns `true` when the current load was intercepted (popup path), so the
 * caller can skip normal boot for this frame.
 */
export function handleSsoPopupBootIfNeeded(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  const hasToken = params.has("sesame_token");
  const hasStatus = params.has("status");
  if (!hasToken && !hasStatus) return false;
  if (!isPopupContext()) return false;

  const opener = window.opener as Window;
  const message: SsoPopupMessage = hasToken
    ? {
        type: SSO_POPUP_MESSAGE_TYPE,
        status: "ok",
        sesameToken: params.get("sesame_token") ?? "",
      }
    : {
        type: SSO_POPUP_MESSAGE_TYPE,
        status: "ko",
        reason: params.get("status"),
      };

  try {
    opener.postMessage(message, window.location.origin);
  } catch (err) {
    console.error("[ssoPopup] postMessage to opener failed", err);
    return false;
  }

  try {
    window.close();
  } catch {
    // Some browsers refuse to close windows they didn't script-open — fall back
    // to a minimal "you can close this" screen rendered by the main app.
  }
  return true;
}

export type SsoPopupOptions = {
  onSuccess: (sesameToken: string) => void;
  onError: (reason: string | null) => void;
  onDismissed: () => void;
};

const POPUP_WIDTH = 480;
const POPUP_HEIGHT = 640;

function centerFeatures(width: number, height: number): string {
  const dualScreenLeft = window.screenX ?? window.screenLeft ?? 0;
  const dualScreenTop = window.screenY ?? window.screenTop ?? 0;
  const w = window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;
  const h = window.innerHeight ?? document.documentElement.clientHeight ?? screen.height;
  const left = Math.max(0, dualScreenLeft + (w - width) / 2);
  const top = Math.max(0, dualScreenTop + (h - height) / 2);
  return [
    `width=${width}`,
    `height=${height}`,
    `left=${Math.round(left)}`,
    `top=${Math.round(top)}`,
    "menubar=no",
    "toolbar=no",
    "location=no",
    "status=no",
    "resizable=yes",
    "scrollbars=yes",
  ].join(",");
}

/**
 * Open the SSO provider URL in a centered popup and resolve when the popup
 * forwards a message (via {@link handleSsoPopupBootIfNeeded}) or is closed by
 * the user. The returned function cleans up listeners early if the caller
 * unmounts.
 */
export function openSsoPopup(url: string, options: SsoPopupOptions): () => void {
  const popup = window.open(url, SSO_POPUP_NAME, centerFeatures(POPUP_WIDTH, POPUP_HEIGHT));
  if (!popup) {
    options.onError("popup_blocked");
    return () => {};
  }
  popup.focus?.();

  let settled = false;
  const settle = (fn: () => void) => {
    if (settled) return;
    settled = true;
    fn();
    cleanup();
  };

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data as Partial<SsoPopupMessage> | null;
    if (!data || data.type !== SSO_POPUP_MESSAGE_TYPE) return;
    if (data.status === "ok" && typeof data.sesameToken === "string" && data.sesameToken.length > 0) {
      settle(() => options.onSuccess(data.sesameToken!));
      return;
    }
    if (data.status === "ko") {
      settle(() => options.onError(data.reason ?? null));
    }
  };

  const pollInterval = window.setInterval(() => {
    if (popup.closed) {
      settle(() => options.onDismissed());
    }
  }, 500);

  window.addEventListener("message", onMessage);

  function cleanup() {
    window.removeEventListener("message", onMessage);
    window.clearInterval(pollInterval);
    if (popup && !popup.closed) {
      try {
        popup.close();
      } catch {
        // ignored
      }
    }
  }

  return () => settle(() => options.onDismissed());
}
