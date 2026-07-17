# Plan 003: Rate-limit guest OTP requests and verification attempts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d57f784..HEAD -- src/actions/guest-rsvp.actions.ts src/db/schema/guest-otp.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-verification-baseline.md (test infra). Coordinate with plans/002 if both touch `guest-rsvp.actions.ts` — apply this plan after 002.
- **Category**: security
- **Planned at**: commit `d57f784`, 2026-07-11

## Why this matters

Guests confirm attendance ("Confirmação") via a 6-digit OTP emailed to them. `verifyGuestOTP` accepts unlimited attempts within the 10-minute expiry window: an attacker who knows a guest's email and an event ID can iterate the 1,000,000 possible codes (each attempt is just a DB lookup — no counter, no lockout) and forge that guest's RSVP, which also creates a `matchReservations` row feeding the payment flow. `requestGuestOTP` is likewise unthrottled, so an attacker can spam arbitrary inboxes with OTP emails from the team's Resend sender (reputation damage + email cost). This plan adds attempt counting with lockout on verification and a resend cooldown on requests.

## Current state

- `src/db/schema/guest-otp.ts` — full current table:

```ts
export const guestEventOtp = pgTable("guest_event_otp", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  matchSessionId: integer("match_session_id")
    .notNull()
    .references(() => matchSessions.id, { onDelete: "cascade" }),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

- `src/actions/guest-rsvp.actions.ts` — `requestGuestOTP` (~line 100–190): normalizes email, checks pending fines, then deletes any existing OTP row for (email, eventId), inserts a fresh row with `expiresAt = now + 10min`, and emails the code via `sendGuestRsvpOtp`. In dev without `RESEND_API_KEY` it logs the OTP to console.
- Same file — `verifyGuestOTP(eventId, email, otp, name)` (~line 192): after event-state checks, does a single lookup:

```ts
const record = await db.query.guestEventOtp.findFirst({
  where: and(
    eq(guestEventOtp.email, normalizedEmail),
    eq(guestEventOtp.matchSessionId, eventId),
    eq(guestEventOtp.otp, otp),
    gt(guestEventOtp.expiresAt, new Date()),
  ),
});
if (!record) {
  return { success: false, error: "Código inválido ou expirado" };
}
```

No attempt counter exists anywhere. Both functions are plain `async function` exports (not `withAction`) returning `{ success, error?: string }` with PT-PT error strings — keep that shape.

- Conventions: PT-PT user-facing strings; English identifiers; error strings in this file are plain PT-PT sentences (see excerpts). CONTEXT.md vocabulary: OTP flow = "validação de PIN".

## Commands you will need

| Purpose   | Command           | Expected on success |
|-----------|-------------------|---------------------|
| Typecheck | `pnpm ts-check`   | exit 0              |
| Lint      | `pnpm lint`       | exit 0              |
| Tests     | `pnpm test`       | all pass            |
| Migration | `pnpm db:generate`| new SQL file in `src/db/migrations/` |

## Scope

**In scope**:
- `src/db/schema/guest-otp.ts` (add columns) + generated migration
- `src/actions/guest-rsvp.actions.ts`
- `src/actions/__tests__/guest-rsvp.rate-limit.test.ts` (create)
- The guest RSVP UI component only if a new error code must be displayed (locate via `grep -rn "verifyGuestOTP" src/app src/components src/hooks`) — plus locale files `src/locales/*.json` if you add a translation key
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- Auth OTP for account login (`src/actions/auth-otp.actions.ts`) — separate flow, better-auth-managed.
- IP-based rate limiting / middleware — no infra for it here (Vercel), and email+event scoping suffices for this threat.
- Ownership/authorization logic added by Plan 002 in this file — don't refactor it.

## Git workflow

- Branch: `advisor/003-guest-otp-rate-limiting`
- Conventional commits, e.g. `fix(security): lock out guest OTP verification after 5 failed attempts`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Extend the schema

Add to `guestEventOtp`:

```ts
attempts: integer("attempts").notNull().default(0),
lockedUntil: timestamp("locked_until"),
```

Run `pnpm db:generate`. Do not run `db:push`/`db:migration` — the operator applies migrations.

**Verify**: new migration SQL contains `attempts` and `locked_until`; `pnpm ts-check` → exit 0.

### Step 2: Lockout logic in `verifyGuestOTP`

Replace the single combined lookup with fetch-then-compare so failures can be counted:

1. Fetch the row by `(email, matchSessionId)` only (drop `otp` and `expiresAt` from the WHERE).
2. If no row → return existing `"Código inválido ou expirado"`.
3. If `lockedUntil` is set and in the future → return `{ success: false, error: "OTP_LOCKED" }` (new machine code — see Step 4 for UI copy).
4. If `expiresAt <= now` → delete the row, return `"Código inválido ou expirado"`.
5. Compare codes with constant-time equality (`timingSafeEqual` from `node:crypto` with a length guard, since both are 6-digit strings this is trivial).
6. On mismatch: increment `attempts`; if the new value `>= 5`, set `lockedUntil = now + 15min`. Single `db.update(guestEventOtp).set(...)`. Return `"Código inválido ou expirado"` (do not reveal remaining attempts).
7. On match: proceed with the existing success path unchanged (it already deletes the OTP row, which also clears the counter).

**Verify**: `pnpm ts-check` → exit 0.

### Step 3: Resend cooldown in `requestGuestOTP`

Before the delete+insert, fetch the existing row for `(normalizedEmail, eventId)`. If it exists and `createdAt > now - 60s`, return `{ success: false, error: "OTP_COOLDOWN" }` without sending email. Also: if the existing row has `lockedUntil` in the future, keep the lockout — return `"OTP_LOCKED"` instead of issuing a fresh code (otherwise requesting a new code resets the brute-force budget).

**Verify**: `pnpm ts-check` → exit 0.

### Step 4: Surface the two new error codes in the UI

Find the component calling `requestGuestOTP`/`verifyGuestOTP` (`grep -rn "verifyGuestOTP\|requestGuestOTP" src --include="*.tsx" --include="*.ts" | grep -v actions/`). It already branches on error strings like `"EVENT_HAS_FINES"` / `"EVENT_ROSTER_PRIORITY"` — follow that existing pattern for `"OTP_LOCKED"` and `"OTP_COOLDOWN"`. PT-PT copy via `useTranslations` with keys added to **all four** locale files (`pt.json`, `en.json`, `es.json`, `fr.json` — parity is mandatory per repo rules). Suggested PT-PT copy: OTP_LOCKED → "Demasiadas tentativas. Tenta novamente dentro de 15 minutos."; OTP_COOLDOWN → "Aguarda um minuto antes de pedir novo PIN."

**Verify**: `pnpm lint` → exit 0; keys exist in all 4 locale files (`grep -l "OTP_LOCKED" src/locales/*.json` → 4 files, or the equivalent nested key).

### Step 5: Tests

Create `src/actions/__tests__/guest-rsvp.rate-limit.test.ts` using Plan 001's mock pattern (`vi.mock("@/db/client")` etc. — this file imports email + fines helpers; mock those modules too). Cases:

1. Wrong OTP 5 times → 5th response still generic error; update called with `lockedUntil` set.
2. Locked row → `OTP_LOCKED` without comparing codes.
3. Correct OTP after 3 failures (not locked) → success path reached.
4. `requestGuestOTP` within 60s of `createdAt` → `OTP_COOLDOWN`, email sender not called.
5. `requestGuestOTP` while locked → `OTP_LOCKED`, no new OTP inserted.

**Verify**: `pnpm test` → all pass.

## Test plan

Covered in Step 5 — ≥5 cases, modeled on Plan 001's `action-helpers.test.ts` mock structure.

## Done criteria

- [ ] `pnpm ts-check`, `pnpm lint`, `pnpm test` all exit 0
- [ ] Migration file with `attempts` + `locked_until` exists; no migration executed
- [ ] `verifyGuestOTP` no longer matches the OTP inside the SQL WHERE clause (fetch-then-compare)
- [ ] Locale keys present in all 4 locale files
- [ ] No files outside scope modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 002 has not landed and `guest-rsvp.actions.ts` differs materially from the excerpts (drift/merge order).
- The UI component handles errors via a mechanism other than branching on error strings (would make Step 4's approach wrong).
- You find an additional caller of `verifyGuestOTP` beyond the RSVP UI (e.g. a payment-time re-verification) — lockout semantics would need review.

## Maintenance notes

- Lockout is per (email, event). A distributed attacker rotating emails still can't target a specific victim's code, which is the asset here.
- If the product later wants IP throttling, do it in `middleware.ts`/edge (or a Vercel WAF rule), not in these actions.
- Reviewer focus: the lockout must not be resettable via `requestGuestOTP` (Step 3, second clause) — that's the classic bypass.
