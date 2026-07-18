# Plan 004: Finish the PostHog→Statsig migration and clean up dependencies

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d57f784..HEAD -- package.json src/lib/posthog-server.ts src/providers instrumentation-client.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: none (independent of 001–003; if run concurrently with 002, coordinate on `src/actions/*.ts` merge conflicts — 002 edits the same action files)
- **Category**: tech-debt / migration / deps
- **Planned at**: commit `d57f784`, 2026-07-11

## Why this matters

Commit `ed6d680` ("replace PostHog with Statsig") swapped the client provider to Statsig but left PostHog half-alive: `instrumentation-client.ts` still initializes posthog-js in every browser session (so **both** client SDKs run in production), and all server-side events (`trackServerEvent`) still go exclusively to PostHog — Statsig receives zero server events. Two analytics SDKs ship in the bundle, events split across two backends, and nobody can trust either dashboard. Separately, the dependency tree carries confirmed dead weight (`motion`, `@tanstack/react-store`, `bcryptjs` — zero imports each), a stale npm `package-lock.json` alongside the canonical `pnpm-lock.yaml`, and two audit-flagged packages (nodemailer 6.x with high advisories; drizzle-orm below the 0.45.2 identifier-escaping fix). One plan, because every item is verified by the same build/audit gates.

**Decision assumed by this plan (confirm with operator if in doubt): Statsig is the destination; PostHog is removed entirely.** The git history supports this (migration commit + key-to-env refactor), but see STOP conditions.

## Current state

- `instrumentation-client.ts` (repo root) — initializes posthog-js when `NEXT_PUBLIC_POSTHOG_KEY` is set (api_host `/ingest`, capture_exceptions). Runs on every client session via Next.js instrumentation.
- `src/providers/posthog-provider.tsx` — full PostHog client provider (init, identify, manual pageviews). **Not referenced** by `src/providers/index.tsx` (which composes QueryClient → Theme → `AnalyticsProvider` (Statsig) → CookieConsent → Toaster). Verify it is unreferenced: `grep -rn "posthog-provider" src` should show only the file itself.
- `src/providers/analytics.tsx` — Statsig provider:

```tsx
const { client } = useClientAsyncInit(
  process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY || "",
  { userID: "a-user" },
  { plugins: [new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin()] },
);
return (
  <StatsigProvider client={client} loadingComponent={<div>Loading...</div>}>
```

Two defects to fix while here: `userID` is hardcoded `"a-user"` (all users collapse into one identity), and `loadingComponent={<div>Loading...</div>}` blocks the entire app behind analytics init.

- `src/lib/posthog-server.ts` — `getPostHogServer()` singleton + `trackServerEvent(distinctId, event, properties?)` which fails silently when unconfigured. Called from 6 action files: `src/actions/waitlist.actions.ts`, `payments.actions.ts`, `attendance.actions.ts`, `match-sessions.actions.ts`, `teams.actions.ts`, `guest-rsvp.actions.ts` (grep `trackServerEvent` for exact lines). Event names in use include `payment_submitted`, `guest_rsvp_completed`.
- `package.json` deps: `posthog-js@^1.399.1`, `posthog-node@^5.40.0`, `motion@^12.42.2` (0 imports — all animation imports are `framer-motion`, 39 files), `@tanstack/react-store@^0.9.3` (0 imports; `zustand` is the state lib, used in `src/hooks/use-teams.ts`), `bcryptjs@^2.4.3` + devDep `@types/bcryptjs` (0 imports; better-auth hashes internally), `nodemailer@^6.10.1`, `drizzle-orm@^0.44.7`.
- Both `package-lock.json` (stale, June) and `pnpm-lock.yaml` (current) exist at root. pnpm is canonical (pnpm-workspace.yaml, session tooling).
- `pnpm audit --prod` currently reports: nodemailer ≤ various thresholds — DoS in addressparser (GHSA-rcmh-qjqh-p98v, fixed ≥7.0.11), raw-option SSRF/file-read (GHSA-c7w3-x93f-qmm8, fixed ≥9.0.1), OAuth2 TLS bypass (GHSA-r7g4-qg5f-qqm2, fixed ≥8.0.8); drizzle-orm SQL identifier escaping (GHSA-gpj5-g38j-94v9, fixed ≥0.45.2).
- `next.config.ts` — check for a PostHog `/ingest` rewrite/proxy block (the instrumentation file targets `api_host: "/ingest"`); if present it is removed in Step 2.
- There is also a root file `posthog-setup-report.md` — **leave it**; Plan 005 handles docs.

## Commands you will need

| Purpose   | Command             | Expected on success |
|-----------|---------------------|---------------------|
| Install   | `pnpm install`      | exit 0              |
| Typecheck | `pnpm ts-check`     | exit 0              |
| Lint      | `pnpm lint`         | exit 0              |
| Build     | `pnpm build`        | exit 0              |
| Audit     | `pnpm audit --prod` | no high/critical for nodemailer or drizzle-orm |
| Tests     | `pnpm test`         | all pass (if Plan 001 landed) |

## Scope

**In scope**:
- `package.json`, `pnpm-lock.yaml` (via pnpm commands only), delete `package-lock.json`
- `instrumentation-client.ts`, delete `src/providers/posthog-provider.tsx`, `src/lib/posthog-server.ts` → replaced by `src/lib/analytics-server.ts`
- `src/providers/analytics.tsx`
- The 6 action files, ONLY the `trackServerEvent` import lines (call sites keep the same function name/signature)
- `next.config.ts` (only to remove a PostHog `/ingest` proxy block if one exists)
- `.env.example` (add `NEXT_PUBLIC_STATSIG_CLIENT_KEY` and, if Step 3 uses it, `STATSIG_SERVER_SECRET_KEY`; remove PostHog vars if listed)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `framer-motion`, `gsap`, `lottie-react` — all actively used; consolidation rejected (see plans/README.md).
- Any event *names* or the places events are fired — semantics unchanged.
- Auth logic in the action files (Plan 002's territory).
- `posthog-setup-report.md`, CLAUDE.md, GEMINI.md — Plan 005.

## Git workflow

- Branch: `advisor/004-analytics-and-deps`
- One commit per step, conventional style (e.g. `chore: remove dead deps and stale npm lockfile`, `feat: route server analytics events to Statsig`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Remove dead deps and the stale lockfile

1. Confirm zero usage (expect no matches outside package files):
   `grep -rn "from \"motion" src/ | grep -v framer-motion` → none;
   `grep -rn "@tanstack/react-store" src/` → none;
   `grep -rn "bcryptjs" src/ types/ scripts/` → none.
2. `pnpm remove motion @tanstack/react-store bcryptjs @types/bcryptjs`
3. `git rm package-lock.json`
4. Add `"packageManager": "pnpm@<installed major.minor.patch>"` to `package.json` (get version via `pnpm --version`).

**Verify**: `pnpm install` exit 0; `pnpm build` exit 0.

### Step 2: Remove the PostHog client side

1. Rewrite `instrumentation-client.ts` to remove the posthog import/init. If nothing else belongs there, leave the file exporting nothing but a comment, or delete it if Next allows (check: `grep -rn "instrumentation-client" next.config.ts` — with Next 16 the file is auto-detected; deleting it is fine when empty).
2. `git rm src/providers/posthog-provider.tsx` (after confirming `grep -rn "posthog-provider\|PostHogProvider" src` matches only the file itself).
3. If `next.config.ts` contains a rewrite/proxy for `/ingest` (PostHog reverse proxy), remove that block only.
4. `pnpm remove posthog-js`

**Verify**: `pnpm build` exit 0; `grep -rn "posthog-js" src instrumentation-client.ts 2>/dev/null` → no matches.

### Step 3: Route server events to Statsig

Create `src/lib/analytics-server.ts` exporting the **same signature** `trackServerEvent(distinctId: string, event: string, properties?: Record<string, unknown>): void` so call sites only change their import path.

Implementation: use Statsig's Node server SDK. `pnpm add @statsig/statsig-node-core` — **first check the current package name/API in Statsig docs (statsig.com/docs) or the `@statsig/*` packages already installed; if the server SDK package or its init/logEvent API differs from this sketch, follow the real API and note the deviation**. Shape to aim for:

```ts
// singleton init with process.env.STATSIG_SERVER_SECRET_KEY; if the key is
// missing, warn once and no-op (mirror posthog-server.ts's fail-silent behavior)
// logEvent({ userID: distinctId }, event, undefined, properties)
```

Then in the 6 action files replace `import { trackServerEvent } from "@/lib/posthog-server"` with `from "@/lib/analytics-server"` (call sites unchanged). Delete `src/lib/posthog-server.ts`. `pnpm remove posthog-node`. Add `STATSIG_SERVER_SECRET_KEY=` to `.env.example`.

**Verify**: `pnpm ts-check` exit 0; `grep -rn "posthog" src --include="*.ts" --include="*.tsx" -il` → no matches; `pnpm build` exit 0.

### Step 4: Fix the Statsig client provider identity and loading gate

In `src/providers/analytics.tsx`:
1. Replace `{ userID: "a-user" }` with the real user: use `useSession()` from `@/lib/auth-client` (same hook the old posthog-provider used) and pass `{ userID: session?.user?.id ?? "anonymous" }`. Re-render/update the Statsig user when the session id changes — follow `@statsig/react-bindings` docs for `updateUserAsync` or key the provider appropriately; keep it simple.
2. Replace `loadingComponent={<div>Loading...</div>}` with `loadingComponent={children}` or render children directly while initializing — analytics must never block the app shell. (If the `StatsigProvider` API requires a component, pass `<>{children}</>`… verify against the installed version's types.)

**Verify**: `pnpm ts-check` exit 0; `pnpm build` exit 0; `grep -n "a-user\|Loading\.\.\." src/providers/analytics.tsx` → no matches.

### Step 5: Patch vulnerable deps

1. `pnpm add nodemailer@^9` and `pnpm add -D @types/nodemailer@latest`. Grep usage (`grep -rn "nodemailer" src -l`) and read the changelog notes for v7→v9 breaking changes affecting the APIs actually used (likely `createTransport` + `sendMail` — stable across majors). Fix any type errors.
2. `pnpm add drizzle-orm@^0.45.2`. Run `pnpm ts-check` — drizzle minor bumps occasionally tighten types on query builders; fix mechanical errors only. If more than ~10 type errors appear, STOP condition.

**Verify**: `pnpm audit --prod` → no high/critical advisories for nodemailer or drizzle-orm; `pnpm ts-check` and `pnpm build` exit 0.

### Step 6: Smoke-check email and analytics paths

No test infra covers these; do a static trace: confirm `src/lib/email.ts` (nodemailer usage) still typechecks and that every former `posthog-server` import now resolves to `analytics-server` (`grep -rn "trackServerEvent" src -l` → 6 action files + `src/lib/analytics-server.ts` only).

**Verify**: the grep result above; `pnpm build` exit 0.

## Test plan

If Plan 001 landed: add `src/lib/__tests__/analytics-server.test.ts` — mock the Statsig SDK module; assert (1) no key → no-op without throwing, (2) with key → logEvent called with `userID = distinctId` and the event name. Model on `src/lib/__tests__/team-access.test.ts`. If Plan 001 has not landed, note that in the status row and rely on build gates.

## Done criteria

- [ ] `pnpm ts-check`, `pnpm lint`, `pnpm build` exit 0 (`pnpm test` too, if test infra exists)
- [ ] `grep -rin "posthog" src instrumentation-client.ts package.json 2>/dev/null` → no matches
- [ ] `package-lock.json` deleted; `packageManager` field present
- [ ] `motion`, `@tanstack/react-store`, `bcryptjs`, `posthog-js`, `posthog-node` absent from `package.json`
- [ ] `pnpm audit --prod` shows no high/critical for nodemailer or drizzle-orm
- [ ] `src/providers/analytics.tsx` contains neither `"a-user"` nor a blocking loading div
- [ ] No files outside scope modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Evidence appears that PostHog is intentionally kept (e.g. an ADR, a comment saying dual-tracking is deliberate, or the operator says so) — the whole premise changes.
- The Statsig Node server SDK cannot be identified/installed, or its API differs so much the same-signature wrapper is impossible — report options instead of inventing an HTTP call.
- nodemailer v9 breaks `src/lib/email.ts` beyond mechanical fixes (transport API changed for the SMTP/Resend path in use).
- drizzle-orm 0.45.x upgrade produces >10 type errors or any runtime-behavior-relevant change in generated SQL for existing queries.
- `motion`, `@tanstack/react-store`, or `bcryptjs` turn out to have a real import somewhere (the Step 1 greps find matches).

## Maintenance notes

- Future events: one function (`trackServerEvent` in `analytics-server.ts`), one backend (Statsig). Reviewers should reject any new `posthog` import.
- `STATSIG_SERVER_SECRET_KEY` must be set in Vercel env for server events to flow; the wrapper fails silent by design (matching prior behavior) — if events go missing, check that first.
- Deferred: consolidating gsap/lottie/framer-motion (rejected — all in real use); Statsig session-replay sampling config; migrating historical PostHog data.
