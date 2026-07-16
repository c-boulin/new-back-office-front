# Dating Admin Console

Multi-tenant admin panel for dating products, built as a pure React frontend
against an existing backend API. Authentication is handled entirely by an
internal SSO (OIDC) — no passwords, no bypass, including super-admins.

## Read this first

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — the golden rules, tech
  stack, and folder map. Read before adding a feature.
- **[docs/COMPONENTS.md](docs/COMPONENTS.md)** — usage examples for every
  common component.

## Scripts

- `npm run dev` — dev server.
- `npm run build` — production build.
- `npm run build:development` — build with development flags.
- `npm run typecheck` — TypeScript strict typecheck.
- `npm run lint` — ESLint with strict rules.
- `npm run format` — Prettier + Tailwind class sort.

## Environment

Set in `.env`:

```
VITE_API_BASE_URL=<backend base URL>
VITE_SSO_AUTHORITY=<internal SSO OIDC issuer>
VITE_SSO_CLIENT_ID=<OIDC client id>
VITE_SSO_REDIRECT_URI=<https://.../auth/callback>
VITE_SSO_POST_LOGOUT_REDIRECT_URI=<https://.../login>
VITE_SSO_SCOPE="openid profile email offline_access"
```

## Key patterns

- **State:** React Query for server, Zustand for global, `useState` for local,
  `useRef` for non-render.
- **Data:** every backend response is parsed with Zod then adapted from
  snake_case to a camelCase domain model.
- **Design:** shadcn/ui primitives, composed into the common design system in
  `src/components/common`. Tenant theme is driven by CSS variables so the same
  components re-skin for every tenant.
- **i18n:** `react-i18next`, English and French, per-feature namespaces.

See `docs/ARCHITECTURE.md` for the full picture.
