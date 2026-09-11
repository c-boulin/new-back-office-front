# Contributing

## Commit convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(users): add ban dialog
fix(auth): refresh interceptor single-flight
docs(architecture): clarify tenant routing
refactor(datatable): split into columns + wrapper
```

## Before you open a PR

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run format` has been run.
- New feature includes: schemas, adaptors, api, types, page, and locales
  (en + fr).
- Every new data view handles loading / empty / error / success explicitly.
- Every destructive action goes through `ConfirmDialog` and is behind a
  `PermissionGate`.

## Review checklist

- No `useEffect` used except for listeners / subscriptions.
- No server data mirrored in Zustand.
- No shadcn primitive re-implemented in `components/common` or feature folders.
- No hardcoded colors — all styles use theme tokens.
- No password field, session bypass, or non-SSO auth path introduced.
- All new user input is sanitized before hitting the DOM or the backend.
