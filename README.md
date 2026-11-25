# btl-frontend

Web app of the Smart Contract Workflow project (course: Lập trình Web nâng cao). React 19, Vite, TypeScript, Ant Design 6.

The base (UI kit, layout, i18n, sign-in, generic CRUD screens) is ported from CodeCash (`github.com/Tunhoclaptrinh/Code-n-Cash`, commit `c667ec4`), built here step by step; see `docs/PHAN_TICH.md` and `CHANGELOG.md`.

```bash
pnpm install
pnpm dev          # http://127.0.0.1:5173, API proxied to http://127.0.0.1:3000
pnpm check        # typecheck, lint, format, test, build
```

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
