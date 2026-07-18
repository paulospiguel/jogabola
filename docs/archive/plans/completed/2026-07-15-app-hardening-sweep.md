# App Hardening Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the remaining audited findings across the whole app — client-trusted AI payment check, global CORS wildcard, swallowed errors, forbidden enums, mock data presented as real, a 735-line action file, and the unfinished docs/README work from plan 005.

**Architecture:** Delta sweep on top of the 2026-07-11 audit. Plans 001-004 and 006 are already executed and verified in code (CI + vitest baseline, IDOR ownership checks with `canActOnReservation`/`guestAccessToken`, OTP `attempts`/`lockedUntil` rate limiting, PostHog removal, timer UX). This plan fixes only what is still open, each task independently shippable. No schema changes; one mechanical file split preserving the public import path via barrel re-exports.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · Drizzle · vitest (node) · next-intl · biome

## Global Constraints

- Server Actions are security boundaries: never trust client-supplied verdicts, ids, or roles (CONTEXT.md / dev-coder).
- No TypeScript `enum` — literal unions or `as const` objects (CONTEXT.md convention).
- Arena UI copy via next-intl in **all** of `pt.json`, `en.json`, `es.json`, `fr.json`.
- Conventional commits, one per task.
- Verification per task: `pnpm test && pnpm ts-check` exit 0, plus `npx biome check <touched files>` clean (repo has 5 pre-existing lint errors in `src/components/timer/{log-card-sheet,log-goal-sheet,player-picker,use-match-store}` — do not add new ones).
- Final task runs `pnpm build`.

## Audit status (why these tasks and not others)

| Audit finding | Status |
|---|---|
| Zero test infra (001) | ✅ done — CI, vitest, 163 tests |
| IDOR in payment/attendance actions (002) | ✅ done — `canActOnReservation`, auth tests |
| OTP brute-force (003) | ✅ done — `attempts`/`lockedUntil` in `guest-otp.ts` |
| PostHog dual-SDK + CVEs (004) | ✅ done — no posthog in package.json, nodemailer 9.x |
| Stale CLAUDE.md/GEMINI.md (005) | ✅ done via AGENTS.md symlink consolidation |
| README + posthog report + .env.example (005) | ❌ **open → Task 7** |
| AI payment check trusts client confidence (#821) | ❌ **open → Task 1** |
| CORS wildcard (#audit) | ❌ **open → Task 2** |
| Empty catches swallow errors (#828) | ❌ **open → Task 3** |
| TS enums violate convention (#831) | ❌ **open → Task 4** |
| Mock data shipped in Rankings/Historical (#818) | ❌ **open → Task 5 (honest labeling; real data is a future plan)** |
| God files in actions layer | ❌ **open → Task 6 (payments.actions.ts, the largest)** |

---

### Task 1: Stop auto-approving payments from a client-supplied AI verdict

**Files:**
- Modify: `src/actions/payment-verification.actions.ts:36-39`
- Test: extend `src/actions/__tests__/payments.status.test.ts` only if it asserts the old auto-approve path (check first — see Step 1)

**Interfaces:**
- Consumes: existing `verifyPaymentProof` action; `paymentPrechecks` insert stays unchanged (the client hint is still recorded for the organizer's review UI).
- Produces: behavior change only — `payments.status` is always set to `"review_required"` by this action; `"paid_unverified"` can no longer be reached from client input.

**Why:** `aiCheck` (decision + confidence) arrives from the browser. Any user can POST `{ decision: "likely_valid", confidence: 1 }` and flip their payment to `paid_unverified`, skipping review. The precheck stays useful as a *hint* shown to the organizer; it must not be an approval authority.

- [ ] **Step 1: Check existing test expectations**

Run: `grep -rn "paid_unverified" src/actions/__tests__/ src/actions/payment-verification.actions.ts`
If any test asserts that `verifyPaymentProof` produces `paid_unverified`, update that assertion to `review_required` in the same commit. If the grep only hits the action file, no test edits needed.

- [ ] **Step 2: Remove the client-controlled branch**

In `src/actions/payment-verification.actions.ts`, replace:

```ts
    const nextStatus =
      aiCheck.decision === "likely_valid" && aiCheck.confidence >= 0.85
        ? "paid_unverified"
        : "review_required";
```

with:

```ts
    // aiCheck comes from the client and is recorded only as a review hint —
    // it must never auto-approve. Approval requires the organizer's action.
    const nextStatus = "review_required" as const;
```

- [ ] **Step 3: Verify**

Run: `pnpm test && pnpm ts-check`
Expected: exit 0 (payment auth/status suites still pass).
Run: `grep -n "paid_unverified" src/actions/payment-verification.actions.ts`
Expected: no matches.

- [ ] **Step 4: Commit**

```bash
git add src/actions/payment-verification.actions.ts src/actions/__tests__/
git commit -m "fix(payments): never auto-approve from client-supplied AI precheck"
```

---

### Task 2: Remove the global CORS wildcard

**Files:**
- Modify: `next.config.ts:44-61` (headers block for `source: "/(.*)"`)

**Interfaces:**
- Consumes: nothing.
- Produces: behavior change — no `Access-Control-Allow-*` headers app-wide. `X-Frame-Options: DENY` stays.

**Why:** `Access-Control-Allow-Origin: *` with `Authorization` allowed is applied to every route including API routes. Server Actions and app pages are same-origin; nothing in the app performs credentialed cross-origin calls to itself. The wildcard only widens the attack surface.

- [ ] **Step 1: Confirm nothing depends on cross-origin fetches to this app**

Run: `grep -rn "fetch(\`http\|fetch(\"http" src --include="*.ts*" | grep -v "localhost\|qrserver\|node_modules" | head`
Expected: external APIs only (outbound calls are unaffected by our response headers). If a first-party absolute-URL fetch appears, note it and scope a per-route header instead — do not keep the global wildcard.

- [ ] **Step 2: Delete the three CORS headers**

In `next.config.ts`, inside the `headers` array for `source: "/(.*)"`, delete these three entries, keeping `X-Frame-Options`:

```ts
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
```

- [ ] **Step 3: Verify**

Run: `pnpm ts-check` — exit 0. Restart the dev server, then:

```bash
curl -sI http://localhost:3000/ | grep -i "access-control\|x-frame"
```

Expected: `X-Frame-Options: DENY` present, no `Access-Control-*` lines. Browser smoke: login page loads, one server action round-trip works (e.g. open `/timer` and create a match — no CORS errors in console).

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "fix(security): drop global CORS wildcard headers"
```

---

### Task 3: Stop swallowing errors silently

**Files:**
- Modify: `src/hooks/use-event-chat.ts:80-83`
- Modify: `src/actions/profile.actions.ts:35`, `src/actions/payments.actions.ts:148,538,626`, `src/actions/attendance.actions.ts:319` (log-and-keep-fallback pattern)

**Interfaces:**
- Consumes: nothing new.
- Produces: no API changes — same fallbacks, now observable in logs.

- [ ] **Step 1: Fix the chat hook's dead catch**

In `src/hooks/use-event-chat.ts`, replace:

```ts
      try {
        Promise.resolve(client.close()).catch(() => {});
      } catch (e) {}
```

with:

```ts
      try {
        Promise.resolve(client.close()).catch(() => {});
      } catch (error) {
        console.error("event-chat: failed to close realtime client", error);
      }
```

- [ ] **Step 2: Make the four action catches observable**

For each location (`profile.actions.ts:35`, `payments.actions.ts:148`, `payments.actions.ts:538`, `payments.actions.ts:626`, `attendance.actions.ts:319`): read the surrounding function (`sed -n '<line-15>,<line+5>p' <file>`). Keep the existing fallback/return behavior exactly as is; add one log line as the first statement in the catch, binding the error:

```ts
  } catch (error) {
    console.error("<file-scope>: <function name> failed", error);
    // existing fallback stays unchanged
```

Where `<file-scope>` is `profile`, `payments`, or `attendance` and `<function name>` is the enclosing exported function. If a catch is genuinely expected-and-benign (e.g. optional cleanup where failure is normal), instead of logging add a one-line comment stating why silence is correct — every empty catch must end up either logging or justified.

- [ ] **Step 3: Verify and commit**

Run: `pnpm test && pnpm ts-check` — exit 0.
Run: `grep -rn "catch {$" src/actions/profile.actions.ts src/actions/payments.actions.ts src/actions/attendance.actions.ts | wc -l`
Expected: `0` (each catch now binds `(error)` or carries a justification comment).

```bash
git add src/hooks/use-event-chat.ts src/actions/profile.actions.ts src/actions/payments.actions.ts src/actions/attendance.actions.ts
git commit -m "fix(observability): log swallowed errors, keep fallbacks"
```

---

### Task 4: Replace forbidden TypeScript enums

**Files:**
- Modify: `src/lib/notion.ts:3-9`
- Modify: `src/lib/utils.ts:34-37`

**Interfaces:**
- Consumes: `TypeProperty` is module-local to `notion.ts`; `FileType` has zero imports anywhere (verified: `grep -rn "FileType" src` matches only `utils.ts`).
- Produces: same runtime values for `TypeProperty` usages inside `notion.ts`.

- [ ] **Step 1: Convert `TypeProperty`**

In `src/lib/notion.ts`, replace:

```ts
enum TypeProperty {
  Tester = "Tester",
  Waitlist = "Waitlist",
  Team = "Team",
  Investor = "Investor",
  Developer = "Developer",
}
```

with:

```ts
const TypeProperty = {
  Tester: "Tester",
  Waitlist: "Waitlist",
  Team: "Team",
  Investor: "Investor",
  Developer: "Developer",
} as const;

type TypeProperty = (typeof TypeProperty)[keyof typeof TypeProperty];
```

(Usages like `TypeProperty.Waitlist` keep working unchanged.)

- [ ] **Step 2: Delete dead `FileType`**

Run first to re-confirm zero usage: `grep -rn "FileType" src --include="*.ts*"`
Expected: only `src/lib/utils.ts`. Then delete from `src/lib/utils.ts`:

```ts
export enum FileType {
  Pdf = "application/pdf",
  Heic = "image/heic",
}
```

- [ ] **Step 3: Verify and commit**

Run: `pnpm test && pnpm ts-check` — exit 0.
Run: `grep -rn "^export enum\|^enum " src --include="*.ts"` — no matches.

```bash
git add src/lib/notion.ts src/lib/utils.ts
git commit -m "refactor: replace enums with const objects per repo convention"
```

---

### Task 5: Label Rankings/Historical mock data as demonstration

**Files:**
- Modify: `src/app/(mobile)/(protected)/arena/rankings/_components/rankings-client.tsx` (after the `<ScreenHeader>` line, ~line 41)
- Modify: `src/app/(mobile)/(protected)/arena/historical/_components/historical-client.tsx` (same pattern — locate its `<ScreenHeader` and insert directly after)
- Modify: `src/locales/{pt,en,es,fr}.json` (namespaces `arenaRankings` and `arenaHistorical`)

**Interfaces:**
- Consumes: both clients already use `useTranslations("arenaRankings")` / `useTranslations("arenaHistorical")` and render fixtures from `../_fixtures/*-mock`.
- Produces: a visible demo notice. Real data implementation stays a separate future plan (query layer + season aggregation — out of scope here).

**Why:** Both screens ship hardcoded fixtures (`LIGA_STANDINGS`, `TOP_SCORERS`, …) presented as real user data. Until the real queries exist, users must not be misled.

- [ ] **Step 1: Add locale keys**

Add `"demoNotice"` to both namespaces in all 4 locales (anchor: first key inside `arenaRankings` / `arenaHistorical`):

pt: `"demoNotice": "Dados de demonstração — os teus resultados reais vão aparecer aqui em breve."`
en: `"demoNotice": "Demo data — your real results will show up here soon."`
es: `"demoNotice": "Datos de demostración: tus resultados reales aparecerán aquí pronto."`
fr: `"demoNotice": "Données de démonstration — vos vrais résultats apparaîtront ici bientôt."`

Validate: `for f in src/locales/*.json; do python3 -m json.tool "$f" > /dev/null && echo OK; done` → 4× OK.

- [ ] **Step 2: Render the notice in both clients**

In `rankings-client.tsx`, directly after `<ScreenHeader title={t("title")} />` insert:

```tsx
      <p className="mx-4 mt-3 rounded-[12px] border border-arena-warning/30 bg-arena-warning/10 px-3 py-2 text-xs font-semibold text-arena-warning">
        {t("demoNotice")}
      </p>
```

In `historical-client.tsx`, find its `<ScreenHeader` element (`grep -n "ScreenHeader" <file>`) and insert the identical block directly after it (that file's `t` is bound to `arenaHistorical`, so the same `t("demoNotice")` call resolves its own namespace).

- [ ] **Step 3: Verify and commit**

Run: `pnpm test && pnpm ts-check` — exit 0. Browser (authenticated session): `/arena/rankings` and `/arena/historical` show the amber notice under the header in PT.

```bash
git add "src/app/(mobile)/(protected)/arena/rankings/_components/rankings-client.tsx" "src/app/(mobile)/(protected)/arena/historical/_components/historical-client.tsx" src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "fix(arena): label rankings/historical fixtures as demo data"
```

---

### Task 6: Split `payments.actions.ts` (735 lines) into cohesive modules

**Files:**
- Create: `src/actions/payments/shared.ts` (private helpers used by more than one group; NO `"use server"`)
- Create: `src/actions/payments/payment-lifecycle.actions.ts` (`"use server"`: `createPayment`, `updatePaymentStatus`, `markPaymentManually`, `markPaymentAsRefunded`, `markPaymentAsCredited`)
- Create: `src/actions/payments/payment-proofs.actions.ts` (`"use server"`: `submitPaymentProof`, `requestPresignedUrl`, `requestPaymentProof`)
- Create: `src/actions/payments/payment-queries.actions.ts` (`"use server"`: `getTeamPayments`, `getPaymentById`, `getMyPaymentForEvent`)
- Modify: `src/actions/payments.actions.ts` → becomes a barrel (no `"use server"`; re-exports only)

**Interfaces:**
- Consumes: the 11 existing exports at `payments.actions.ts` lines 45, 81, 181, 265, 336, 390, 456, 543, 631, 688, 692.
- Produces: identical public API at the same import path `@/actions/payments.actions` — zero changes in any consumer file.

- [ ] **Step 1: Map internal helpers**

Run: `grep -n "^const \|^async function \|^function " src/actions/payments.actions.ts | grep -v "^.*export"`
Every non-exported symbol used by exports in more than one target module goes to `src/actions/payments/shared.ts` (plain module — helpers keep working because they run inside the server actions that import them); a helper used by exactly one group moves with that group.

- [ ] **Step 2: Move each export group verbatim**

Create the three `payment-*.actions.ts` files, each starting with `"use server";`, then cut-paste the listed exported functions **unchanged**, plus their group-local helpers and the exact imports each needs (copy from the original header; let `ts-check` flag unused ones). Move shared helpers to `shared.ts` and import them where used.

- [ ] **Step 3: Turn the original into a barrel**

Replace the entire content of `src/actions/payments.actions.ts` with:

```ts
// Barrel: public payments API. Implementation split by concern under ./payments/.
export {
  createPayment,
  markPaymentAsCredited,
  markPaymentAsRefunded,
  markPaymentManually,
  updatePaymentStatus,
} from "./payments/payment-lifecycle.actions";
export {
  requestPaymentProof,
  requestPresignedUrl,
  submitPaymentProof,
} from "./payments/payment-proofs.actions";
export {
  getMyPaymentForEvent,
  getPaymentById,
  getTeamPayments,
} from "./payments/payment-queries.actions";
```

- [ ] **Step 4: Verify hard**

Run: `pnpm test && pnpm ts-check` — exit 0 (payments auth/status suites exercise the moved code through the barrel).
Run: `wc -l src/actions/payments/*.ts src/actions/payments.actions.ts` — no file above ~300 lines.
Run: `pnpm build` — exit 0 (validates the `"use server"` boundaries).
Browser smoke: any payment screen loads (e.g. `/arena/payments`).

- [ ] **Step 5: Commit**

```bash
git add src/actions/payments.actions.ts src/actions/payments/
git commit -m "refactor(payments): split 735-line action file by concern behind a barrel"
```

---

### Task 7: Finish plan 005 — README, stale report, .env.example

**Files:**
- Create: `README.md`
- Delete: `posthog-setup-report.md`
- Modify: `.env.example` (append missing vars, empty values)

**Interfaces:**
- Consumes: verified facts — stack per `AGENTS.md`, scripts per `package.json`, vars per `.env.example` + `grep -rn "CRON_SECRET\|NEXT_PUBLIC_STATSIG" src/lib src --include="*.ts" -l` (confirm exact env var names before writing them).
- Produces: onboarding docs; no code.

- [ ] **Step 1: Create `README.md`**

```markdown
# JogaBola

Plataforma de gestão de equipas de futebol amador — convocatórias, plantel,
pagamentos (racha), estatísticas, chat por evento e cronómetro de jogos.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · pnpm · Drizzle ORM + Postgres ·
better-auth (+ passkey) · Ably (chat em tempo real) · next-intl (PT-PT base,
4 línguas) · Tailwind CSS 4 · Statsig (analytics) · Resend (email) ·
Cloudflare R2 (comprovativos) · Vercel (deploy + crons).

## Começar

```bash
pnpm install
docker-compose up -d          # Postgres local (jogabola/jogabola, porta 5432)
cp .env.example .env          # preencher valores
pnpm db:migration             # aplicar migrações
pnpm dev                      # http://localhost:3000
```

## Scripts

| Comando | Faz |
|---|---|
| `pnpm dev` | dev server (turbo) |
| `pnpm build` / `pnpm start` | build / serve produção |
| `pnpm lint` | biome check `src` |
| `pnpm ts-check` | typecheck |
| `pnpm test` / `pnpm test:watch` | vitest |
| `pnpm db:generate` · `db:migration` · `db:push` · `db:studio` | drizzle-kit |

## Documentação

| Ficheiro | Conteúdo |
|---|---|
| `AGENTS.md` | Instruções canónicas (CLAUDE.md/GEMINI.md são symlinks) |
| `PRODUCT.md` | Intenção de produto |
| `CONTEXT.md` | Glossário de domínio + convenções de código |
| `DESIGN.md` | Design system |
| `docs/adr/` | Decisões de arquitetura |
| `docs/superpowers/plans/README.md` | Índice canónico dos planos de implementação |
```

Then fill an **Environment variables** section by listing every var present in `.env.example` with a one-line purpose derived from usage (`grep -rln "<VAR>" src | head -1` per var). No values, ever.

- [ ] **Step 2: Delete the stale report and complete `.env.example`**

```bash
git rm posthog-setup-report.md
```

Append to `.env.example` (confirm exact names first per Interfaces above; empty values):

```bash
# Statsig analytics (client SDK)
NEXT_PUBLIC_STATSIG_CLIENT_KEY=
# Vercel cron authentication
CRON_SECRET=
```

- [ ] **Step 3: Verify and commit**

Run: `pnpm build` — exit 0. `grep -c "pnpm" README.md` ≥ 5; `.env.example` contains both new vars with empty values; `test ! -f posthog-setup-report.md`.

```bash
git add README.md .env.example
git commit -m "docs: add README, complete .env.example, drop stale posthog report"
```

---

## Final verification

- [ ] `pnpm test && pnpm ts-check && pnpm build` — exit 0; zero new lint errors vs pre-plan HEAD.
- [ ] Security spot-checks: `verifyPaymentProof` cannot yield `paid_unverified`; `curl -sI localhost:3000/` has no `Access-Control-*`.
- [ ] Browser: `/arena/rankings` + `/arena/historical` show demo notices; payments screens work through the barrel.
- [ ] 7 conventional commits.

## Future plans (explicitly out of scope, recorded for roadmap)

1. **Rankings/Historical reais** — query layer sobre match-sessions/goals + agregação por época; remove os fixtures e o aviso (Task 5 é a ponte honesta até lá).
2. **Verificação server-side de comprovativos** — mover a análise AI para o servidor (visão por LLM em server action com a imagem do R2), devolvendo o precheck confiável que a Task 1 deixou de aceitar do cliente.
3. **Split de `teams.actions.ts` (652) e `attendance.actions.ts` (635)** — repetir o padrão da Task 6 quando houver janela.
4. **i18n do módulo timer** + landing SEO (plano diferido existente).
5. **Ponte timer→produto** (guardar jogo na equipa; botão na convocatória — spec do torneio).
