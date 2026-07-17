# Plan 005: Replace stale agent instructions and add a real README

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d57f784..HEAD -- CLAUDE.md GEMINI.md posthog-setup-report.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (but if Plan 004 has NOT landed yet, keep the note about analytics honest — see Step 3)
- **Category**: docs / dx
- **Planned at**: commit `d57f784`, 2026-07-11

## Why this matters

The repo's agent-instruction files (`CLAUDE.md`, `GEMINI.md`) describe a codebase that no longer exists: a single-file HTML prototype ("JogaBola v2.html", React 18 UMD, Babel inline, "zero dependências") with instructions to version changes as `v3.html`/`v4.html`. The actual repo is a Next.js 16 App Router production app. Every AI agent session and every new contributor is actively misled by the first document they read — worse than no docs. `GEMINI.md` also contains genuinely current rules (i18n parity across 4 locales, server-actions-first) mixed into the stale content, so the good parts must be preserved, not deleted. There is also no `README.md` (setup must be reverse-engineered from `.env.example`), and `posthog-setup-report.md` documents an analytics setup that was replaced by Statsig.

## Current state

- `CLAUDE.md` (repo root) — stale sections: "Ficheiros principais" table referencing `JogaBola v2.html` / `JogaBola Desktop v2.html` / `design.md` (none exist at root — the design doc is `DESIGN.md`); "Stack: HTML único · React 18 UMD · Babel inline · zero dependências"; "Pedidos comuns → criar vN.html". Still-valid parts: project one-liner, PT-PT language rule, mobile-first principles.
- `GEMINI.md` — same stale prototype sections, PLUS current rules worth keeping: **i18n mandatory** (zero hardcoded text, `useTranslations`/`getTranslations`, every key synced across `pt.json`, `en.json`, `es.json`, `fr.json`), **Server Actions First** (prefer server actions over REST for backend logic including uploads), PT-PT base language with locale parity.
- `posthog-setup-report.md` — wizard-generated PostHog integration report; superseded by Statsig migration (commit `ed6d680`).
- No `README.md` exists.
- Real intent docs that must be pointed to (all current and good): `PRODUCT.md` (users, purpose, design principles), `CONTEXT.md` (domain glossary — Convocatória/MatchSession, Racha/Payment, etc. — plus code conventions: English identifiers, union types + `as const` no enums, feature-folder structure, server actions flat in `src/actions/`), `DESIGN.md` (design system), `docs/adr/0001-defer-external-league-model.md`, `docs/adr/0002-ably-realtime-event-chat.md`.
- Real stack facts for the README (verified at commit d57f784): Next.js 16 App Router (`next dev --turbo`), React 19, TypeScript, pnpm, Drizzle ORM + Postgres (`docker-compose.yml` runs a local Postgres on 5432, default user/password `jogabola`), better-auth (+ passkey plugin), Ably (event chat), Statsig (analytics — see Step 3 caveat), next-intl (PT-PT base, 4 locales), Tailwind 4 + Radix, Resend (email), Cloudflare R2 via S3 SDK (payment proofs), deployed on Vercel (`vercel.json` has cron config for `/api/cron/*`).
- Scripts: `pnpm dev`, `pnpm build`, `pnpm lint` (biome), `pnpm ts-check`, `pnpm db:generate|db:migration|db:push|db:studio` (drizzle-kit, config at `src/db/drizzle.config.ts`). Add `pnpm test` only if Plan 001 landed (check `package.json`).
- `.env.example` documents: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `AUTH_GOOGLE_ID/SECRET`, `NEXT_PUBLIC_URL`, `NEXT_PUBLIC_APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `NEXT_PUBLIC_IS_BETA`, `APP_LAUNCHED`, `NOTION_API_KEY`, `NOTION_WAITLIST_DB_ID`, `R2_*` (5 vars), `ABLY_API_KEY`. Known gaps to add: `NEXT_PUBLIC_STATSIG_CLIENT_KEY`, `CRON_SECRET` (check `src/lib/cron-auth.ts` for the exact env var name before writing it).

## Commands you will need

| Purpose   | Command         | Expected on success |
|-----------|-----------------|---------------------|
| Lint      | `pnpm lint`     | exit 0 (md files aren't linted, but run it to prove nothing else broke) |
| Typecheck | `pnpm ts-check` | exit 0              |

## Scope

**In scope**:
- `CLAUDE.md` (rewrite)
- `GEMINI.md` (rewrite to mirror CLAUDE.md content)
- `README.md` (create)
- Delete `posthog-setup-report.md`
- `.env.example` (add missing vars with empty placeholder values — NEVER real values)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `PRODUCT.md`, `CONTEXT.md`, `DESIGN.md`, `docs/adr/*` — current and authoritative.
- Any source code.
- `~/.claude/CLAUDE.md` or anything outside the repo.

## Git workflow

- Branch: `advisor/005-docs-refresh`
- Conventional commits, e.g. `docs: replace stale prototype instructions with current stack docs`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Rewrite `CLAUDE.md`

Replace the file's content entirely. Required content (keep it under ~60 lines — it's an index, not a manual):

1. One-paragraph project description (reuse the current first paragraph — it's accurate).
2. **Language**: respostas ao utilizador e UI sempre em PT-PT; identifiers/comments in English.
3. **Stack summary**: Next.js 16 App Router · React 19 · TypeScript · pnpm · Drizzle + Postgres · better-auth · Ably · next-intl · Tailwind 4.
4. **Pointers table**: PRODUCT.md → product intent; CONTEXT.md → domain glossary + code conventions (read before coding); DESIGN.md → design system (read before UI work); docs/adr/ → decisions; plans/ → pending implementation plans.
5. **Verification commands**: `pnpm lint`, `pnpm ts-check`, `pnpm build` (+ `pnpm test` if it exists in package.json at execution time).
6. **Rules carried over from GEMINI.md** (these are current and mandatory): zero hardcoded UI text — always `useTranslations`/`getTranslations`; every new translation key added to all of `pt.json`, `en.json`, `es.json`, `fr.json`; prefer Server Actions over REST API routes for backend logic; mobile-first, desktop has its own layout.
7. Remove ALL references to: `JogaBola v2.html`, `design.md` (lowercase), React 18 UMD, Babel inline, `vN.html` versioning, iOS/Chrome frames.

**Verify**: `grep -in "v2.html\|UMD\|babel" CLAUDE.md` → no matches.

### Step 2: Mirror to `GEMINI.md`

Replace `GEMINI.md` content with: a one-line note "Instruções idênticas a CLAUDE.md — manter sincronizado." followed by the same content as CLAUDE.md (duplicate the body; some tools read only one of the files, so a bare pointer is not enough).

**Verify**: `grep -in "v2.html\|UMD\|babel" GEMINI.md` → no matches.

### Step 3: Create `README.md`

Sections, using the facts inlined in "Current state" (do not invent anything you cannot verify in the repo):

1. **JogaBola** — one paragraph (crib from PRODUCT.md's "Product Purpose").
2. **Stack** — the list from Current state.
3. **Getting started** — exact sequence: `pnpm install` → `docker-compose up -d` (local Postgres, default credentials `jogabola`/`jogabola`, port 5432) → copy `.env.example` to `.env` and fill values → `pnpm db:migration` (apply migrations) → `pnpm dev` → http://localhost:3000. **Caveat to include**: `src/db/client.ts` sets `ssl: "require"`, so a plain local `DATABASE_URL` may need `?sslmode=disable`… actually verify by reading `src/db/client.ts` at execution time and document what's true; if SSL genuinely blocks local docker use, document the workaround the codebase supports rather than changing code (code changes are out of scope).
4. **Environment variables** — table of every var in `.env.example` with one-line purpose (derive purposes from grep: e.g. `grep -rn "RESEND_API_KEY" src -l`). No values.
5. **Scripts** — table of package.json scripts.
6. **Docs map** — same pointers table as CLAUDE.md.
7. **Analytics note**: if Plan 004 status in `plans/README.md` is DONE, say "Statsig (client + server)"; otherwise say "Statsig (client) — server events currently still on PostHog, migration tracked in plans/004".

Then update `.env.example`: append `NEXT_PUBLIC_STATSIG_CLIENT_KEY=` and the cron secret var (exact name from `src/lib/cron-auth.ts`), each with a `#` comment line. Empty values only.

**Verify**: `test -f README.md && grep -c "pnpm" README.md` → ≥ 5; `.env.example` contains the Statsig var.

### Step 4: Delete the stale report

`git rm posthog-setup-report.md`

**Verify**: file absent; `pnpm ts-check` and `pnpm lint` still exit 0.

## Test plan

Not applicable (docs only). The greps in each step are the regression checks.

## Done criteria

- [ ] `grep -rin "v2.html" CLAUDE.md GEMINI.md` → no matches
- [ ] `README.md` exists with setup, env-var table, scripts table, docs map
- [ ] `posthog-setup-report.md` deleted
- [ ] `.env.example` gained Statsig + cron vars, values empty
- [ ] i18n and Server-Actions-First rules present in both CLAUDE.md and GEMINI.md
- [ ] `pnpm lint` and `pnpm ts-check` exit 0
- [ ] No files outside scope modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `CLAUDE.md`/`GEMINI.md` at HEAD no longer match the stale-prototype description (someone already rewrote them).
- `src/lib/cron-auth.ts` doesn't exist or uses no env var (the README env table would be wrong).
- You are tempted to change any `.ts`/`.tsx` file — everything here is docs; report instead.

## Maintenance notes

- CLAUDE.md and GEMINI.md are now duplicated by design; whoever edits one must sync the other (the header line in GEMINI.md says so).
- When Plan 004 lands, update the README analytics note (Step 3.7) if it was written in the "still on PostHog" state.
- README env-var table will drift as vars are added; reviewers should require README updates in any PR that touches `.env.example`.
