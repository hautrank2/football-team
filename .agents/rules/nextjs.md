---
trigger: always_on
glob: src/app/**
description: App Router conventions for this project — how a route is laid out (page.tsx holds the screen, logic in a colocated hook.ts), where page-private components go (_components), and how dynamic/edit pages reuse forms. Read before adding or restructuring any route.
---

# Next.js App Router — route conventions

These rules govern everything under `src/app`. They complement the global rules
(arrow functions, `type` only, shadcn/ui, TanStack Query for server state).

## 1. The page IS the screen — no `*Screen` component

Put the screen's UI **directly in `page.tsx`**, and its logic in a **colocated
`hook.ts`** beside it. Do **not** create a separate `*Screen` component that
`page.tsx` just re-exports.

```
src/app/admin/players/
  page.tsx     // "use client" — the screen UI; default-exports the page
  hook.ts      // usePlayersPage() — all state/effects/handlers/data-shaping
  _components/ // page-private components (dialogs, forms, sub-widgets)
```

```tsx
// page.tsx
"use client";
import { usePlayersPage } from "./hook";

const PlayersPage = () => {
  const s = usePlayersPage();
  return <div>…</div>;
};
export default PlayersPage;
```

```ts
// hook.ts
"use client";
export const usePlayersPage = () => {
  const query = usePlayers({ /* … */ });
  // state, mutations, handlers…
  return { /* what the page renders */ };
};
```

- Name the hook after the page: `use<Route>Page` (`usePlayersPage`,
  `useTeamsPage`, `useHomePage`, `useProfilePage`).
- The page is a **Client Component** (`"use client"`) whenever it uses
  hooks/state — which is the norm here, since data comes from TanStack Query
  hooks, not server components.
- Small presentational sub-components used only by one page (e.g. a card, a stat
  tile) may sit **below** the default export in the same `page.tsx`.

## 2. Not every page needs a hook or its own file

Keep it proportional to the logic:

- **Trivial page** (a redirect, or rendering one shared component) stays a
  one-line `page.tsx` with no `hook.ts`.
  ```tsx
  // admin/page.tsx
  import { redirect } from "next/navigation";
  const AdminPage = () => redirect("/admin/teams");
  export default AdminPage;
  ```
- **Page with real logic** → `page.tsx` + `hook.ts`.

Don't manufacture a `hook.ts` for a page that has nothing to put in it.

## 3. Page-private components live in `_components/`

Anything used by exactly one route goes in a `_components/` folder next to that
route's `page.tsx` (Next ignores `_`-prefixed folders for routing). Lift a
component up to `src/components` **only when a second route uses it** (see the
global reuse rule). Complex ones keep the `index.tsx` + `hook.ts` + `type.ts`
split (complex-component-rule).

## 4. Dynamic routes read params with `useParams`

A client `page.tsx` under `[id]` reads the segment via `useParams`, not props:

```tsx
"use client";
import { useParams } from "next/navigation";

const PlayerEditPage = () => {
  const { id } = useParams<{ id: string }>();
  // usePlayer(id) → render
};
```

(Only reach for the server-component `async ({ params }) => { const { id } = await params }`
form when the page must be a Server Component — rare here.)

## 5. Edit pages reuse the Form, not the Dialog

A create/edit form is split into a **Dialog** wrapper + a standalone **Form**
(form-rule). Export the inner Form so a dedicated `[id]` edit page can render it
**inline** (no modal):

```tsx
// admin/players/[id]/page.tsx
import { PlayerForm, toFormValues } from "../_components/PlayerFormDialog";

<PlayerForm key={player.id} isEdit playerId={player.id}
  defaultValues={toFormValues(player)} onSuccess={back} onCancel={back} />
```

The list page uses `<PlayerFormDialog>`; the edit page uses `<PlayerForm>`. Both
share one form + one `toFormValues` mapper — never duplicate the fields.

## 6. Layouts & providers

- App-level providers (`@/contexts` → `Providers`) + the `<Toaster>` mount **once
  in the root `layout.tsx`**, so every route group has TanStack Query, auth, and
  toasts.
- A route group's `layout.tsx` adds only its chrome (e.g. `(main)` renders the
  header; `admin` renders the sidebar and gates on auth).
- Guarding is done in the layout with `useAuth()` (`isReady`/`user`), redirecting
  guests to `/login`.

## 7. Checklist — adding a route

1. `page.tsx` with the screen UI (`"use client"` if it uses hooks).
2. `hook.ts` beside it (`use<Route>Page`) for state/effects/handlers/data — skip
   if the page is trivial.
3. Page-only components → `_components/`; promote to `src/components` only on
   second use.
4. `[id]` pages read `useParams`; edit pages render the shared inner `*Form`.
5. Keep server state in TanStack Query hooks (`@/hooks`), never `useEffect` +
   `useState`.
