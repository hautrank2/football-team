# App

Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + TanStack Query.
Clean baseline for a new project. Coding conventions live in [`.agents/rules`](.agents/rules).

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Set the API base URL in `.env`:

```bash
NEXT_PUBLIC_API_URL=
```

## Structure

```
src/
  app/
    layout.tsx          # root: <html>/<body>, fonts, globals.css
    (main)/
      layout.tsx        # mounts app providers + Header
      page.tsx          # thin screen (no business logic)
  apis/                 # HTTP client + per-resource query/mutation hooks
    http.ts             #   shared fetch wrapper (http.get/post/...)
  contexts/
    query-context.tsx   # QueryClientProvider (TanStack Query v5)
    app-context.tsx     # app-wide non-server state (useApp)
    index.tsx           # <Providers> — mounted once in (main)/layout
  components/
    ui/                 # shadcn/ui primitives
    ui/pages/           # full-page states: ComingSoon / InDevelopment / NotFound / ErrorState
    layouts/            # Header, Nav
  lib/utils.ts          # cn()
  utils/routing.ts      # ROUTES + link helpers
```

## Conventions (see `.agents/rules`)

- Import via the `@/` alias (`@/*` → `src/*`).
- Arrow functions; `type` only (never `interface`).
- UI from shadcn/ui + `lucide-react` icons; colors from semantic tokens only.
- Server state through TanStack Query — never `useEffect` + `useState`.
- Components with logic split into `index.tsx` (UI) + `hook.ts` (logic) + `type.ts`.
