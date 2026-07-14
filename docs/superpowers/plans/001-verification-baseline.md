# Plan 001: Establish a verification baseline — vitest, CI, and first tests on auth-critical code

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d57f784..HEAD -- package.json src/lib/action-helpers.ts src/actions/payments.actions.ts src/lib/team-access.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none
- **Category**: tests
- **Planned at**: commit `d57f784`, 2026-07-11

## Why this matters

This repository has **zero automated tests, no CI, and no pre-commit checks**. The only verification is manual (`pnpm lint`, `pnpm ts-check`, `pnpm build`). The codebase handles money (payment splitting, payment proofs), authentication (OTP for guests), and team permissions — all with no regression safety net. Plans 002 and 003 fix security bugs in server actions; without a test runner and a testing pattern, those fixes cannot lock in their behavior and future changes will silently regress them. This plan installs vitest, adds a GitHub Actions CI workflow, and writes the first tests that establish the *pattern* other plans will follow.

## Current state

- `package.json` — scripts are `build`, `dev`, `lint` (biome check src), `ts-check` (npx tsc --noEmit), `start`, plus `db:*` drizzle scripts. **No `test` script.** Package manager is pnpm (there is also a stale `package-lock.json`; ignore it, do not regenerate it — Plan 004 removes it).
- No `.github/` directory exists — no CI at all.
- No `*.test.*` or `*.spec.*` files exist anywhere under `src/`.
- `src/lib/action-helpers.ts` — server-action wrappers. Excerpt (lines 42–66):

```ts
export function withAction<S extends ZodTypeAny, T>(
  schema: S,
  fn: (data: z.infer<S>) => Promise<ActionResult<T>>,
): (input: unknown) => Promise<ActionResult<T>> {
  return async (input: unknown) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success)
      return validationError(parsed.error.flatten().fieldErrors);
    return fn(parsed.data);
  };
}

export function withAuthAction<S extends ZodTypeAny, T>(
  schema: S,
  fn: (user: AuthUser, data: z.infer<S>) => Promise<ActionResult<T>>,
): (input: unknown) => Promise<ActionResult<T>> {
  return async (input: unknown) => {
    const user = await getAuthUser();
    if (!user) return { success: false, error: { code: "UNAUTHORIZED" } };
    const parsed = schema.safeParse(input);
    if (!parsed.success)
      return validationError(parsed.error.flatten().fieldErrors);
    return fn(user, parsed.data);
  };
}
```

- `src/actions/payments.actions.ts:47-58` — pure function `toUiPaymentStatus(status: string)` maps `PAYMENT_STATUS.PAID_UNVERIFIED → PAYMENT_OVERVIEW_STATUS.VALIDATING`, `APPROVED → CONFIRMED`, `REJECTED → REFUSED`, else passthrough. Constants come from `src/constants/` (grep for `PAYMENT_STATUS` to find the exact file). Note: this function is module-private (not exported). Export it as part of this plan so it can be tested (adding `export` in front of it is in scope).
- `src/lib/team-access.ts:60-80` — `canManageTeam(userId, teamId)`: returns true if user owns the team OR has a `teamMembers` row with role `"owner"` or `"manager"`. Uses `db.query.teams.findFirst` / `db.query.teamMembers.findFirst` from `@/db/client`.
- `src/db/client.ts` — throws at import time if `DATABASE_URL` is unset, and uses `ssl: "require"`. **Therefore unit tests must mock `@/db/client`** — do not attempt to connect to a real database in this plan.
- Path alias: `@/*` maps to `src/*` (see `tsconfig.json`).
- Repo conventions (from `CONTEXT.md`): variables/types/functions in English; union types + `as const` objects, never TS `enum`; code comments in English.

## Commands you will need

| Purpose   | Command                  | Expected on success |
|-----------|--------------------------|---------------------|
| Install   | `pnpm install`           | exit 0              |
| Typecheck | `pnpm ts-check`          | exit 0, no errors   |
| Lint      | `pnpm lint`              | exit 0              |
| Tests     | `pnpm test`              | all pass (after this plan creates it) |

## Scope

**In scope** (the only files you should modify or create):
- `package.json` (add `test` script + devDependencies `vitest`, `@vitejs/plugin-react` if needed)
- `vitest.config.ts` (create)
- `src/actions/payments.actions.ts` (ONLY to add `export` to `toUiPaymentStatus` — no other change)
- `src/lib/__tests__/team-access.test.ts` (create)
- `src/actions/__tests__/payments.status.test.ts` (create)
- `src/lib/__tests__/action-helpers.test.ts` (create)
- `.github/workflows/ci.yml` (create)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Any behavior change to any server action — this plan only characterizes what exists.
- `src/db/client.ts` — do not make `ssl` conditional or otherwise modify it.
- Pre-commit hooks / husky — deferred (repo owner may not want commit-time friction).
- `package-lock.json` — leave as-is; Plan 004 handles it.

## Git workflow

- Branch: `advisor/001-verification-baseline` off the current branch (`releases/jogabola-teams/release02`)
- Commit style: conventional commits, e.g. `feat: add vitest test baseline and CI workflow` (matches `git log` style like "feat: replace PostHog with Statsig…")
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Install vitest and add the test script

Run `pnpm add -D vitest`. Add to `package.json` scripts: `"test": "vitest run"` and `"test:watch": "vitest"`.

Create `vitest.config.ts` at repo root:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

**Verify**: `pnpm test` → exits 0 with "no test files found" (or similar, non-error) OR exits 1 solely because no tests exist yet — either is acceptable at this step.

### Step 2: Unit-test the pure payment status mapper

In `src/actions/payments.actions.ts`, change line 47 from `function toUiPaymentStatus(` to `export function toUiPaymentStatus(`. Nothing else in that file changes.

Create `src/actions/__tests__/payments.status.test.ts`. Because `payments.actions.ts` has `"use server"` and imports `@/db/client` (which throws without `DATABASE_URL`), mock the DB module before importing:

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/db/client", () => ({ db: {} }));
vi.mock("@/lib/posthog-server", () => ({ trackServerEvent: vi.fn() }));

const { toUiPaymentStatus } = await import("@/actions/payments.actions");
```

(If other transitive imports of `payments.actions.ts` also throw at import time — e.g. an S3 client requiring env vars — mock those modules the same way; list each added mock in your report.)

Test cases: `"paid_unverified"` → the VALIDATING value, `"approved"` → CONFIRMED value, `"rejected"` → REFUSED value, unknown string → passthrough. Import the real constants from `src/constants/` (find via `grep -rn "PAYMENT_OVERVIEW_STATUS" src/constants/`) and assert against them, not string literals.

**Verify**: `pnpm test` → the new test file passes (4 assertions).

### Step 3: Unit-test `canManageTeam` with a mocked db

Create `src/lib/__tests__/team-access.test.ts` mocking `@/db/client`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  teamsFindFirst: vi.fn(),
  teamMembersFindFirst: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    query: {
      teams: { findFirst: mocks.teamsFindFirst },
      teamMembers: { findFirst: mocks.teamMembersFindFirst },
    },
  },
}));
```

Cases:
1. user is team owner (`teamsFindFirst` resolves `{ id: 1 }`) → `true`, and `teamMembersFindFirst` not called.
2. not owner, member with role manager (`teamsFindFirst` → undefined, `teamMembersFindFirst` → `{ id: 2 }`) → `true`.
3. not owner, no membership (both → undefined) → `false`.

Note: `src/lib/team-access.ts` may import other modules; if any throw at import time, mock them and report.

**Verify**: `pnpm test` → all tests pass.

### Step 4: Characterize the auth wrappers

Create `src/lib/__tests__/action-helpers.test.ts`. Mock `@/lib/auth` so `auth.api.getSession` is controllable, and mock `next/headers` (`headers: async () => new Headers()`):

```ts
const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: mocks.getSession } } }));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
```

Cases (use a trivial `z.object({ n: z.number() })` schema):
1. `withAction` calls the handler even with **no session** (this characterizes the current no-auth behavior that Plan 002 relies on understanding).
2. `withAction` returns `VALIDATION_ERROR` shape on bad input, handler not called.
3. `withAuthAction` with `getSession` → null returns `{ success: false, error: { code: "UNAUTHORIZED" } }`, handler not called.
4. `withAuthAction` with a session (`{ user: { id: "u1", name: "N", email: "e@x" }, session: {} }`) calls handler with `user.id === "u1"`.

**Verify**: `pnpm test` → all pass.

### Step 5: CI workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [master, "releases/**"]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 11
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm ts-check
      - run: pnpm test
```

**Verify**: `pnpm lint && pnpm ts-check && pnpm test` all exit 0 locally (CI mirrors exactly these).

## Test plan

The tests ARE the deliverable — see steps 2–4. Total: ≥11 test cases across 3 files. There is no pre-existing test to model after; these files become the repo's exemplar pattern (vi.hoisted + vi.mock for `@/db/client` and `@/lib/auth`).

## Done criteria

- [ ] `pnpm test` exits 0 with ≥11 passing tests in 3 files
- [ ] `pnpm ts-check` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `.github/workflows/ci.yml` exists and runs lint + ts-check + test
- [ ] Only in-scope files modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `toUiPaymentStatus` no longer exists at `src/actions/payments.actions.ts:47-58` (drift).
- Importing `payments.actions.ts` or `team-access.ts` in tests requires mocking more than 4 additional modules — that signals the module graph is too entangled; report which imports fail instead of mocking endlessly.
- `pnpm lint` (biome) rejects the `__tests__` layout — report biome's message; do not restructure the lint config beyond adding an ignore for test files if biome flags a rule that cannot apply to tests.
- vitest cannot resolve the `@/` alias after the config above — report, don't switch test frameworks.

## Maintenance notes

- Plans 002 and 003 add tests following the mock pattern established here — reviewers should check those tests import mocks the same way (vi.hoisted).
- When a real test database is desired later (integration tests), `docker-compose.yml` provides Postgres but `src/db/client.ts` forces `ssl: "require"` — that conflict must be resolved then (out of scope now).
- If biome and vitest globals conflict, prefer explicit imports from `vitest` (already the pattern above) over `globals: true`.
