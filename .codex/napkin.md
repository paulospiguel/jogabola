# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-13] Validate UI changes in the running app before closing a design task**
   Do instead: start the local app, inspect the changed route with `playwright-cli`, and only finish after checking layout, spacing, and interaction states.
2. **[2026-03-13] Protected pages can drift from the product shell**
   Do instead: compare protected routes against shared navigation and footer patterns before adding page-specific chrome.

## Interface System
1. **[2026-03-13] Use one dark shell language across public and protected surfaces**
   Do instead: keep canvas in midnight navy, use quiet white borders at low opacity, and reserve neon mint for active state and primary action only.
2. **[2026-03-13] Prefer border-led depth over heavy glow**
   Do instead: build hierarchy with subtle surface shifts and `border-white/8` style separators; add shadows only as soft support.
3. **[2026-03-13] Header, profile hero, and footer should share the same rhythm**
   Do instead: reuse rounded shell containers, capsule navigation/actions, and uppercase micro-labels for section framing.
4. **[2026-03-14] Protected pages should compose from shared shell primitives**
   Do instead: build authenticated screens with a common page header plus reusable hero/stat/section cards before adding route-specific visuals.

## Shell & Command Reliability
1. **[2026-03-13] Quote Next.js App Router paths containing parentheses in shell commands**
   Do instead: wrap paths like `src/app/(protected)/profile/page.tsx` in single quotes when using `sed`, `rg`, or similar tools.

## User Directives
1. **[2026-03-13] Apply `interface-design`, `web-design-guidelines`, `playwright-cli`, and `napkin` when asked for interface consistency**
   Do instead: review current UI patterns first, implement the visual system changes directly, validate in-browser, then persist the recurring rules to the napkin.
2. **[2026-03-13] Links should be plain by default**
   Do instead: keep links without underline, pills, outlined chips, decorative bullets, or special containers unless the user asks for them explicitly.
3. **[2026-03-13] Logged-in pages should not repeat public navigation blocks**
   Do instead: keep internal shells focused on context and actions, and remove marketing-style or cross-area navigation strips from protected pages.

## Code Conventions

### Language
- **Variables, types, functions, constants** → always in **English** (e.g., `attendanceStatus`, `MatchSession`, `PAYMENT_STATUS`)
- **UI strings** → always PT-PT via `useTranslations` (never hardcoded)
- **Code comments** → English

### Types and Constants
- **Union types** for domain status: `type AttendanceStatus = "PAID" | "PENDING" | "TO_VALIDATE"`
- **`const` objects** (`as const`) to prevent repeated literal strings in code:
  ```ts
  export const ATTENDANCE_STATUS = { PAID: "PAID", PENDING: "PENDING" } as const;
  ```
- No native TypeScript `enum` (compilation overhead, same result with union + const)

### Feature Structure (Standard)
```
feature/
  page.tsx              ← server component, fetch + pass props
  _components/          ← isolated UI, single responsibility
  _hooks/               ← state, effects, actions (placed inside feature)
  _utils/               ← feature-specific logic
  _fixtures/            ← typed mock data (temporary, until real data is available)
```
- Truly shared hooks → global `src/hooks/`
- Generic utils → `src/lib/utils.ts`
- Domain constants → global `src/constants/`
- Global Server Actions (e.g., in `src/actions/` or `src/app/actions.ts`)
- Avoid placing shared actions inside features — they are shared across pages

