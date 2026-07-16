import { UserManager, WebStorageStateStore, type User } from "oidc-client-ts";
import { env } from "./env";

export const oidcClient = new UserManager({
  authority: env.sso.authority,
  client_id: env.sso.clientId,
  redirect_uri: env.sso.redirectUri,
  post_logout_redirect_uri: env.sso.postLogoutRedirectUri,
  response_type: "code",
  scope: env.sso.scope,
  automaticSilentRenew: true,
  loadUserInfo: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage }),
});

export type OidcUser = User;
