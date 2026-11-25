# btl-frontend

Web app of the Smart Contract Workflow project (course: Lập trình Web nâng cao). React 19, Vite, TypeScript, Ant Design 6.

The base (UI kit, layout, i18n, sign-in, generic CRUD screens) is ported from CodeCash (`github.com/Tunhoclaptrinh/Code-n-Cash`, commit `c667ec4`), built here step by step; see `docs/PHAN_TICH.md` and `CHANGELOG.md`.

```bash
pnpm install
pnpm dev          # http://127.0.0.1:5173, API proxied to http://127.0.0.1:3000
pnpm check        # typecheck, lint, format, tests with the 50% coverage gate, build
pnpm coverage     # tests and coverage report (coverage/)
```

The API is `btl-backend` (`pnpm dev` there, port 3000). Tests never call it: they answer requests with MSW (`src/test/server.ts`).

## State and access

- Global client state: Redux Toolkit (`src/shared/state`), the session slice behind `useSession()`. Server data: TanStack Query.
- Access: route guard (`navConfig` route permissions), `withPermission` for screens, `<Can>` for parts of a screen; the API checks every call again.

## Layout

```
src/
  features/<area>/   one folder per business area (pages, components, hooks, lib, api)
  shared/            app shell: api client, auth, layout, ui helpers, lib
  i18n/, locales/    vi and en, one JSON per namespace
packages/
  ui/                base components, hooks and theme (ported from UniFlow via CodeCash)
  contracts/         types and resource/permission definitions the app reads
  api-client/        typed HTTP client
  config/            shared TypeScript config
```

## Branches

`base` holds the shared base only; `main` holds the base plus the business features. Base changes go
`core/<task>` → `base` → `main` (merge commit `sync: base → main`); features go `feat/<area>-<task>`
→ `main`. Both branches are protected (pull request, one review, CI). Details:
[docs/QUY_TRINH_NHANH.md](docs/QUY_TRINH_NHANH.md).
