---
trigger: always_on
glob:
description: Global coding conventions for the WMS web app (TypeScript + Next.js App Router + shadcn/ui). Applies to all source under src/.
---

# Global code rules

These rules are mandatory for every new or edited file under `src/`. Match the
surrounding code when a local convention is stricter.

- Tầng API tách 3 lớp: **`src/apis`** (chỉ các function gọi API + kiểu request/response),
  **`src/hooks`** (các hook TanStack Query `useXxx` bọc quanh function đó), và
  **`src/lib/http.ts`** (fetch client dùng chung). Không đặt hook `use*` trong `src/apis`.

## 1. Prefer arrow functions

Use arrow-function expressions for components, hooks, handlers, and helpers.
Reserve `function` declarations only where hoisting is genuinely required.

```tsx
// ✅
export const formatQty = (n: number): string => n.toLocaleString();
export const OrderCard = ({ order }: OrderCardProps) => { ... };

// ❌
export function formatQty(n: number) { ... }
```

## 2. `type` only — never `interface`

Model every shape with `type`. Do not use `interface`.

```ts
// ✅
export type OrderCardProps = { order: Order; compact?: boolean };

// ❌
export interface OrderCardProps { order: Order }
```

## 3. Use shadcn/ui components + lucide icons

- Build UI from the shadcn/ui components in `@/components/ui` (style `base-nova`).
  Do not hand-roll a `<button>`/`<input>`/`<dialog>` when a shadcn primitive
  exists. Add missing primitives via the shadcn registry, not from scratch.
- Use icons from `lucide-react`. Do not add new inline SVG icon paths.

```tsx
// ✅
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

<Button variant="outline"><Plus className="size-4" /> Add</Button>
```

## 4. Never hardcode colors

Colors must come from the semantic design tokens (CSS-variable-backed Tailwind
classes) so light/dark mode switches correctly. Never write raw hex, `rgb()`,
`hsl()`, or named colors, and don't patch colors with `dark:` overrides — the
token already adapts per theme.

```tsx
// ✅ semantic tokens: fg-1/2/3, surface, surface-2, border, brand, primary,
//    secondary, muted, destructive, ring …
<div className="bg-surface-2 text-fg-1 border border-border">…</div>

// ❌
<div style={{ color: "#111827", background: "#fff" }}>…</div>
<div className="text-[#111827] bg-white dark:bg-black">…</div>
```

## 5. Component props naming + folder split

- Every component defines its props as a `type` named `<ComponentName>Props`.
- A **simple** component is a single file `<ComponentName>.tsx`.
- A component with **non-trivial logic** becomes a folder with at least two files:
  - `index.tsx` — UI only; defines `<ComponentName>Props`.
  - `hook.ts` — all logic (state, effects, handlers, data shaping); defines
    `Use<ComponentName>Props` that **extends** the component's props, and returns
    what the UI needs.

```
OrderCard/
  index.tsx   // UI, exports OrderCard + OrderCardProps
  hook.ts     // useOrderCard + UseOrderCardProps
```

```ts
// hook.ts
export type UseOrderCardProps = OrderCardProps & { onDone?: () => void };

export const useOrderCard = ({ order, onDone }: UseOrderCardProps) => {
  const total = useMemo(() => sum(order.lines), [order.lines]);
  const confirm = useCallback(() => onDone?.(), [onDone]);
  return { total, confirm };
};
```

```tsx
// index.tsx
export type OrderCardProps = { order: Order };

export const OrderCard = (props: OrderCardProps) => {
  const { total, confirm } = useOrderCard(props);
  return <div className="bg-surface text-fg-1">…</div>;
};
```

## 6. Optimize renders with `useMemo` / `useCallback`

Memoize derived values with `useMemo` and stable callbacks with `useCallback`,
especially anything passed to child components or dependency arrays. Keep
dependency arrays complete and correct.

## 7. Comments in English

Write all comments (and commit messages) in English. Keep them concise and
explain *why*, not *what*.

## 8. Server state with TanStack Query

All server state (anything fetched from the API) goes through TanStack Query
(`@tanstack/react-query` v5). Do **not** fetch with `useEffect` + `useState`, and
do not keep server data in `useState`/context.

- Each resource's query/mutation hooks live in **`@/hooks/<resource>.ts`** (barrel
  `@/hooks`) and wrap the plain function object from `@/apis/<resource>`. Components
  consume the hook, never call the http client directly.
- Query keys are structured arrays, most-general → most-specific, and include
  every input that changes the result: `["positions", query]`.
- After a mutation, invalidate the affected keys via
  `queryClient.invalidateQueries({ queryKey: ["positions"] })`.
- Use the v5 object API and its status flags (`isPending`, `isError`, `error`).
- The `QueryClientProvider` is mounted once for the app in the `(main)` layout via
  `@/contexts/query-context` — do not create ad-hoc `QueryClient`s per component.

```ts
// @/apis/position.ts — functions + request/response types only, no hooks
export const positionApi = {
  list: (query: PositionQueryDto) => http.get<TableResponseDto<PositionDto>>("/api/position", { params: query }),
  create: (dto: PositionCreateDto) => http.post<PositionDto>("/api/position", { body: dto }),
};

// @/hooks/position.ts — the React Query hooks
export const usePositions = (query: PositionQueryDto) =>
  useQuery({ queryKey: ["positions", query], queryFn: () => positionApi.list(query) });

export const useCreatePosition = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: PositionCreateDto) => positionApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["positions"] }),
  });
};
```

## 9. Types folder — one home, suffixed, barreled

- Every shared type (query params, DTOs, entity models, enums, zod request
  schemas) lives under **`src/types`** and is re-exported from `@/types`
  (`src/types/index.ts`). The only types that stay colocated are **component prop
  types** (`<Component>Props` / `Use<Component>Props`).
- Name every type in `src/types` with a suffix that states its role: **`…Model`**
  (an entity / client-side model), **`…Enum`** (an enum/union), or **`…Dto`**
  (a request or response payload, including query params). Envelope helper types
  (`ApiResponse`, `ApiError`, `HttpError`, `TableResponseDto`) are the fixed
  exceptions.
- `src/types` may hold runtime values too (zod schemas in `schemas.ts`, `objectId`).
  Because some of those pull in server-only packages (`@prisma/client`), **client
  code must import from `@/types` with `import type { … }`** so the runtime is
  erased and never reaches the browser bundle. Server code (API routes) may value-
  import the zod schemas normally.

```ts
// @/types/player.ts
export type PlayerDto = Omit<Player, "passwordHash"> & { team?: Team | null };
export type PlayerCreateDto = { username: string; password: string; /* … */ };
export type PlayerQueryDto = ListQueryDto & { fullName?: string };

// consumer (client) — type-only import
import type { PlayerDto } from "@/types";
```

## 10. Storage keys — defined once, project-prefixed, UPPERCASE

Never inline a `localStorage` / `sessionStorage` / cookie key at the call site.
Define it in `@/constants` (`src/constants/storage-keys.ts`) and prefix it with
the project name in UPPER_CASE.

```ts
// @/constants/storage-keys.ts
export const STORAGE_KEYS = { AUTH_USER: "FOOTBALL_AUTH_USER" } as const;

// usage
localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
```

## 11. Server utilities live in `src/lib`

There is no `src/server` folder. Server-only helpers (route wrapper + error
envelope, response builders, list-query parsing/filters, request validation, R2
client) live in `src/lib` (`route.ts`, `response.ts`, `query.ts`, `validation.ts`,
`r2.ts`). The shared fetch client is `src/lib/http.ts`. Reusable, framework-free
helpers may instead go in `src/utils`.

## Project conventions (from the existing source)

- Import via the `@/` alias (`@/*` → `src/*`); prefer barrels (`@/components/ui`,
  `@/lib`, `@/types`, `@/hooks`, `@/apis`, `@/constants`, `@/components/ui/pages`).
- Merge class names with `cn` from `@/lib/utils` (twMerge + clsx).
- Any file using hooks, browser APIs, or event handlers starts with `"use client";`.
- Route `page.tsx` files stay thin: read context (`useApp` from
  `@/contexts/app-context`) and render a screen/component — no business logic.
- Routing helpers live in `@/utils/routing`; shared full-page states
  (coming-soon / error / 404 / in-development) in `@/components/ui/pages`.
