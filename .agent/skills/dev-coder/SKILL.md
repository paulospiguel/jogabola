---
name: dev-coder
description: >
  Use this skill for coding work in the JogaBola MVP: Next.js App Router,
  TypeScript, Server Actions, Better Auth, Drizzle, Tailwind CSS 4, and Arena UI.
  Triggers on implementation, refactor, frontend/UI, auth, server-action,
  dashboard, mobile-first, MVP layout, design system, code quality, or folder
  organization requests. Enforces feature boundaries, Tailwind token usage, and
  the current JogaBola Arena visual system.
---

# Dev Coder - JogaBola MVP

Build production-ready code for the current JogaBola MVP. Favor clear feature
boundaries, server-validated mutations, mobile-first UI, and the Arena visual
system. Use this skill as the default implementation standard for this repo.

## Operating Loop

1. Inspect local context first: files, existing components, actions, schemas,
   and current dirty git state.
2. State a mini-plan with files to change when work is non-trivial.
3. Implement in small slices. Keep unrelated refactors out.
4. Validate with the narrowest useful commands first, then broader checks when
   risk is high.
5. Report exact residual risks, blocked checks, and known unrelated failures.

## MVP Architecture Standard

### Default Folder Shape

Prefer feature-first organization for new or refactored MVP code:

```txt
src/
  app/
    (public)/
    (protected)/
      arena/
        _components/
        events/
        teams/
        notifications/
  components/
    arena/          # shared Arena UI primitives only
    ui/                # shadcn/base primitives
  actions/             # existing server actions; migrate to feature actions only when scope allows
  features/<feature>/  # new larger domains
    actions/
    components/
    hooks/
    mappers/
    schemas/
    services/
    types/
```

### Boundaries

- `app/*/page.tsx`: route composition, auth/session load, and passing minimal
  props to client components.
- `_components/*client.tsx`: local interaction state and view composition.
- `components/arena/*`: reusable Arena primitives only. No route-specific
  business rules.
- `actions/*`: server-only mutation/read entrypoints. Validate input and auth
  here.
- `services` / `mappers`: domain decisions, formatting, DTO to ViewModel.

Avoid global `components/` dumping. Put feature-specific UI near the route or
feature.

## Coding Rules

### TypeScript

- Use interfaces for object shapes and public props.
- Avoid `any`. If unavoidable for external flexible payloads, isolate and
  document with a narrow comment.
- Use literal unions or `as const` objects instead of enums.
- Separate DTO/input/ViewModel when data crosses boundaries.
- Use early returns and guard clauses.

### React / Next.js

- Prefer Server Components by default.
- Add `"use client"` only for local state, events, browser APIs, animation, or
  wallet/auth client hooks.
- Do not fetch data in `useEffect`. Use Server Components, Server Actions, or
  TanStack Query where client caching is actually needed.
- Derive state during render; avoid effect-based derived state.
- Keep components focused. Refactor when:
  - UI component exceeds ~220 lines.
  - Logic/action/service exceeds ~160 lines.
  - Component has more than 8 props.
  - File mixes UI, validation, data access, and domain decisions.

### Server Actions

Server actions are security boundaries.

- Always validate inputs with Zod or equivalent local schema.
- Always derive `userId`/role from server auth/session, never from client input.
- Return predictable result objects:

```ts
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };
```

- Revalidate affected routes after mutations.
- Do not leak internal DB/provider errors to the client.

### Better Auth

- Configure providers/plugins in `src/lib/auth.ts`.
- Configure client plugins in `src/lib/auth-client.ts`.
- For email code login, use Better Auth email OTP plugin:
  - server: `emailOTP()`
  - client: `emailOTPClient()`
  - UI flow: email -> code validation
- Never trust auth identifiers submitted by forms.

## UI Agent Standard

Use the current MVP Arena layout as the source of truth, not the older PES/gamer
theme. The Arena UI is quiet, dense, dark, mobile-first, and operational.

### Arena Tokens

Define and consume standardized Tailwind v4 tokens from `src/styles/globals.css`:

```css
--color-arena-bg: #0b0f14;
--color-arena-bg-sec: #111827;
--color-arena-surface: #151c26;
--color-arena-surface-el: #1b2430;
--color-arena-border: #263244;
--color-arena-text: #f5f7fa;
--color-arena-text-sec: #a7b0be;
--color-arena-text-muted: #6b7280;
--color-arena-primary: #7cff4f;
--color-arena-success: #22c55e;
--color-arena-warning: #f59e0b;
--color-arena-danger: #ef4444;
--color-arena-info: #38bdf8;
--color-arena-highlight: #facc15;
```

Use utilities like:

- `bg-arena-bg`, `bg-arena-surface`, `bg-arena-bg-sec`
- `text-arena-text`, `text-arena-text-sec`, `text-arena-text-muted`
- `border-arena-border`
- `bg-arena-primary`, `text-arena-primary`
- state colors: `arena-success`, `arena-warning`, `arena-danger`, `arena-info`

Do not hardcode Arena hex colors in JSX unless the value is truly dynamic
(canvas drawing, avatar color generation, chart palette).

### Styling Rules

- Use Tailwind classes first. Avoid `style={{ ... }}`.
- Use `cn()` from `@/lib/utils` for conditional classes.
- Use `@theme` tokens for repeated colors, not scattered arbitrary hex.
- Inline style is allowed only for computed values:
  - dynamic color generated from data
  - progress/flex/position values derived from runtime state
  - canvas/animation library internals
- Mobile first: base styles target mobile; add `md:`/`lg:` for desktop.
- Desktop Arena uses fixed left sidebar; mobile uses bottom nav only.
- Cards: prefer `rounded-[14px]` / `rounded-2xl`, `border-arena-border`,
  `bg-arena-surface`.
- Buttons: use icon+label for commands. Icon-only needs `aria-label`.
- Avoid nested decorative cards and marketing hero layouts inside operational
  Arena screens.

### Arena Layout Pattern

For protected Arena screens:

```tsx
<div className="jb-page">
  <div className="jb-page-inner">
    <header className="jb-topbar">...</header>
    <section className="jb-stack">...</section>
  </div>
</div>
```

Shared CSS classes such as `jb-page`, `jb-card`, `jb-action`,
`jb-section-label`, `jb-dashboard-grid`, and `jb-stack` should stay in
`globals.css` and use Arena tokens internally.

### Background / Motion

- Arena background may use `DotGrid` and subtle radial overlays.
- Keep background layers behind content and pointer-safe unless interaction is
  explicitly required.
- Motion should support utility, not spectacle. Use short transitions and avoid
  layout shift.

## Refactor Policy

Refactor when the change touches an already messy area, but keep scope tied to
the request.

When refactoring:

1. Extract reusable primitive only if used by at least two places or clearly
   belongs to `arena`.
2. Extract route-specific child component into the route `_components`.
3. Extract pure mapper/formatter before duplicating date/status/display logic.
4. Delete unused folders/components only after `rg` proves no imports remain.
5. Preserve user/unrelated dirty work.

## Validation Checklist

Before final response:

- `rg` proves removed files/imports are unused.
- `biome check` or repo formatter passes for touched files.
- TypeScript check is run or a focused typecheck confirms touched files.
- For UI: route compiles with dev server or browser check where possible.
- For auth/server actions: session/auth validation is server-side.
- Mention known unrelated failures with exact file/line.

## Anti-Patterns

- God components, god hooks, or giant `utils.ts`.
- Inline style for static colors, spacing, borders, or typography.
- Client-supplied `userId`, `organizerId`, `managerId`, or role trusted by server.
- Fetch + parse + domain rules + UI in one client component.
- API route for mutation when Server Action fits.
- Barrel exports that hide bundle-heavy imports.
- UI changes without mobile and desktop behavior considered.
- Old PES/gamer colors used in Arena MVP unless explicitly requested.

## References

- `references/ui-agent.md` - detailed UI rules for current MVP Arena.
- `references/coder-agent.md` - detailed coding and architecture rules.
