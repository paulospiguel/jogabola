# Plan 002: Enforce authentication and authorization on payment, attendance, and chat-token server surfaces

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat d57f784..HEAD -- src/actions/payments.actions.ts src/actions/attendance.actions.ts src/actions/payment-verification.actions.ts src/app/api/ably/token/route.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: [001-verification-baseline.md](001-verification-baseline.md)
- **Category**: security
- **Planned at**: commit `d57f784`, 2026-07-11

## Why this matters

Several state-changing server actions are exported with `withAction`, which validates the input schema but performs **no session check and no ownership check**. Next.js server actions are POST endpoints reachable by anyone; today an anonymous caller can forge attendance records, create payment rows, mark payments as "paid awaiting validation", and inject fake AI-precheck results for **any** user and **any** event, given only guessable integer IDs. Separately, three "manager*" attendance functions authenticate the caller but never verify the caller manages the event's team — any logged-in user can remove or block participants on any event. Finally, the Ably token endpoint grants read access to **all** event chats to any logged-in user. This plan closes each hole while preserving the legitimate unauthenticated guest flow (guests confirm via email OTP and then pay without an account — that flow must keep working).

## Current state

Files and their roles:

- `src/lib/action-helpers.ts` — `withAction` (schema only, no auth) and `withAuthAction` (session required; returns `{ success: false, error: { code: "UNAUTHORIZED" } }` when no session, then calls `fn(user, data)` where `user: AuthUser = { id, name, email, teamId }`). Also exports `getAuthUser(): Promise<AuthUser | null>`.
- `src/lib/team-access.ts:60` — `canManageTeam(userId: string, teamId: number): Promise<boolean>` — true for team owner or `teamMembers` role `"owner" | "manager"`. This is the canonical gate for manager mutations (its doc comment says: "Use this to gate mutations (create/edit events, attendance, payment registration)").
- `src/actions/payments.actions.ts` — `createPayment` (line 60), `submitPaymentProof` (line 91), `requestPresignedUrl` (line 171): all `withAction`, no identity or ownership checks. `updatePaymentStatus` (~line 318) already checks `canManageTeam` — use it as the exemplar. Payments link to `matchReservations` via `payments.matchReservationId`; `matchReservations.playerId` identifies who the reservation belongs to (may be a real user or a "ghost user" created for a guest).
- `src/actions/attendance.actions.ts:26` — `upsertAttendance = withAction(upsertAttendanceSchema, ...)`: raw upsert of `(matchSessionId, playerId, status, note)` with zero checks.

```ts
// src/actions/attendance.actions.ts:26-39 (current)
export const upsertAttendance = withAction(
  upsertAttendanceSchema,
  async data => {
    const [row] = await db
      .insert(attendance)
      .values({ ...data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [attendance.matchSessionId, attendance.playerId],
        set: { status: data.status, note: data.note, updatedAt: new Date() },
      })
      .returning();
    return { success: true, data: row };
  },
);
```

- `src/actions/attendance.actions.ts` — `managerUpdateParticipantStatus` (~line 441), `managerRemoveParticipant` (~line 493), `managerBlockParticipant` (~line 537): each fetches the session, returns `"Não autenticado"` if absent, fetches `event.teamId`… and then **never uses it for authorization**:

```ts
// pattern in all three functions (current)
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user?.id) {
  return { success: false as const, error: "Não autenticado" };
}
const event = await db.query.matchSessions.findFirst({
  columns: { teamId: true },
  where: eq(matchSessions.id, eventId),
});
if (!event) { return { success: false as const, error: "Evento não encontrado" }; }
// ← no canManageTeam(session.user.id, event.teamId) check — proceeds to mutate
```

- `src/actions/payment-verification.actions.ts` — `verifyPaymentProof = withAction(...)`: accepts client-supplied `aiCheck` (`decision`, `confidence`, extracted fields), inserts a `paymentPrechecks` row, and sets payment status to `"paid_unverified"` when `decision === "likely_valid" && confidence >= 0.85`. No auth, no ownership. Note: `"paid_unverified"` renders to captains as "VALIDATING", so the captain still validates manually — the exposure is unauthorized status mutation and poisoned precheck records, not silent auto-approval.
- `src/app/api/ably/token/route.ts` — grants `{"event-chat:*": ["subscribe", "history"]}` to any authenticated user (full file is 26 lines; capability at lines 17–19). Chat access control lives in `src/actions/event-chat.actions.ts` (look for a participation check such as `canParticipateInChat` or equivalent — read that file before Step 6 and reuse its check).

**The guest constraint (critical):** guests have no session. The guest flow is: `verifyGuestOTP` (in `src/actions/guest-rsvp.actions.ts`, ~line 192) validates an emailed 6-digit OTP, then creates the attendance row and a `matchReservations` row, and returns the reservation to the client. The client then calls `createPayment` → `requestPresignedUrl` → `submitPaymentProof` **without a session** (see `src/app/(mobile)/(athlete)/event/[id]/_components/athlete-rsvp-sheet.tsx:214` calling `createPayment`, and `src/hooks/use-proof-upload.ts`). A comment at `payments.actions.ts` (~line 214) confirms guests are intentionally allowed. Therefore payment actions cannot simply become `withAuthAction`.

Repo conventions to honor:
- Error results: `{ success: false, error: { code: "SOME_CODE", message?: string } }` (see `requestPresignedUrl`'s `INVALID_FILE_TYPE` return in `payments.actions.ts:177-186`) or the plain-string style in older attendance functions — match whichever the function you're editing already uses.
- User-facing strings in PT-PT; code and comments in English (CONTEXT.md).
- Vocabulary from CONTEXT.md: "Convocatória" = `MatchSession`; "Confirmação" = attendance; "Convidado" = guest; ghost users are real `user` rows created from a guest email.

## Commands you will need

| Purpose   | Command         | Expected on success |
|-----------|-----------------|---------------------|
| Typecheck | `pnpm ts-check` | exit 0              |
| Lint      | `pnpm lint`     | exit 0              |
| Tests     | `pnpm test`     | all pass            |
| Build     | `pnpm build`    | exit 0              |

## Scope

**In scope**:
- `src/actions/payments.actions.ts`
- `src/actions/attendance.actions.ts`
- `src/actions/payment-verification.actions.ts`
- `src/actions/guest-rsvp.actions.ts` (only to mint/return the guest access token in Step 2)
- `src/db/schema/` — one new column on `matchReservations` (guest access token) + generated migration via `pnpm db:generate`
- `src/app/api/ably/token/route.ts`
- Client call sites that must pass the new guest token: `src/app/(mobile)/(athlete)/event/[id]/_components/athlete-rsvp-sheet.tsx`, `src/hooks/use-proof-upload.ts`, `src/app/(mobile)/(athlete)/event/[id]/payment/result/[paymentId]/_components/payment-result-client.tsx`, and the chat hook `src/hooks/use-event-chat.ts` (only for the Ably token query param in Step 6)
- New test files under `src/actions/__tests__/`
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `src/lib/action-helpers.ts` — do not change wrapper semantics; compose with them.
- OTP request/verify rate limiting — that is Plan 003.
- `updatePaymentStatus`, `markPaymentManually`, and other already-guarded manager payment actions — leave as-is.
- Any schema change beyond the single token column.
- The event-chat server actions' own checks — reuse, don't rewrite.

## Git workflow

- Branch: `advisor/002-server-action-auth-hardening`
- Conventional commits, one per step (e.g. `fix(security): require team manager on participant mutations`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Gate the three manager attendance functions

In `src/actions/attendance.actions.ts`, in `managerUpdateParticipantStatus`, `managerRemoveParticipant`, and `managerBlockParticipant`: immediately after the `if (!event)` check, add:

```ts
const canManage = await canManageTeam(session.user.id, event.teamId);
if (!canManage) {
  return { success: false as const, error: "Sem permissão para gerir este evento" };
}
```

Import `canManageTeam` from `@/lib/team-access` (check whether the file already imports it; add if not).

**Verify**: `pnpm ts-check` → exit 0. `grep -c "canManageTeam" src/actions/attendance.actions.ts` → ≥ 3.

### Step 2: Add a guest access token to reservations

The guest payment path needs a bearer capability that only the OTP-verified guest holds.

1. In `src/db/schema/` locate the `matchReservations` table definition (grep `matchReservations = pgTable`). Add a nullable column: `guestAccessToken: text("guest_access_token")`.
2. Run `pnpm db:generate` to produce the migration under `src/db/migrations/`. Do **not** run `db:push`/`db:migration` against any database — generating the SQL file is enough; the operator applies it.
3. In `src/actions/guest-rsvp.actions.ts` → `verifyGuestOTP`: when upserting the `matchReservations` row, set `guestAccessToken` to a fresh token (`crypto.randomUUID()` — import `randomUUID` from `node:crypto`) in both the insert values and the `onConflictDoUpdate.set` clause, and include the token in what the function returns to the client alongside the reservation.

**Verify**: `pnpm ts-check` → exit 0; a new SQL file exists in `src/db/migrations/` containing `guest_access_token`.

### Step 3: Ownership checks on `createPayment` and `submitPaymentProof`

Both must authorize as **either** (a) an authenticated user who owns the reservation, **or** (b) a caller presenting the reservation's `guestAccessToken`.

Add a private helper in `payments.actions.ts`:

```ts
async function canActOnReservation(
  matchReservationId: number,
  guestAccessToken: string | undefined,
): Promise<boolean> {
  const reservation = await db.query.matchReservations.findFirst({
    columns: { playerId: true, guestAccessToken: true },
    where: eq(matchReservations.id, matchReservationId),
  });
  if (!reservation) return false;
  const user = await getAuthUser();
  if (user && reservation.playerId === user.id) return true;
  if (
    guestAccessToken &&
    reservation.guestAccessToken &&
    timingSafeEqual(Buffer.from(guestAccessToken), Buffer.from(reservation.guestAccessToken))
  ) return true;
  return false;
}
```

(Guard `timingSafeEqual` against unequal lengths first — it throws on length mismatch; compare lengths and return false. Import from `node:crypto`. If `db.query.matchReservations` is not exposed on the drizzle client, use the `db.select().from(matchReservations)` builder style already used at `payments.actions.ts:66-77`.)

- `createPayment`: add optional `guestAccessToken: z.string().optional()` to `createPaymentSchema` (schemas may live in `src/schemas/payments.schema.ts` — follow where `createPaymentSchema` is defined). At the top of the handler: `if (!(await canActOnReservation(data.matchReservationId, data.guestAccessToken))) return { success: false, error: { code: "FORBIDDEN" } };`. Strip `guestAccessToken` before the `db.insert(payments).values({ ...data })` spread (otherwise it inserts an unknown column — destructure it out).
- `submitPaymentProof`: same optional schema field. Its input is `paymentId`, not a reservation id — resolve the payment's `matchReservationId` first (single select on `payments`), return `{ success: false, error: { code: "PAYMENT_NOT_FOUND" } }` if missing, then apply `canActOnReservation`.
- `requestPresignedUrl`: same treatment as `submitPaymentProof` (it also takes `paymentId`; see its schema at the top of the file). Keep the existing type/size validation untouched.

Update the client call sites to pass the token they received from `verifyGuestOTP` (authenticated athletes pass nothing): `athlete-rsvp-sheet.tsx` (`createPayment({ ... })` at ~line 214 — thread the token through its existing state for the guest branch), `use-proof-upload.ts` (`requestPresignedUrl`/`submitPaymentProof`), `payment-result-client.tsx`. Trace how the reservation currently flows from `verifyGuestOTP`'s return value into these components and carry the token along the same path.

**Verify**: `pnpm ts-check` → exit 0; `pnpm lint` → exit 0.

### Step 4: Gate `upsertAttendance`

Read every call site first: `grep -rn "upsertAttendance" src --include="*.tsx" --include="*.ts" | grep -v actions/attendance`. Expected callers are athlete self-service UI (`src/schemas/attendance.schema.ts` defines the input). Convert it to `withAuthAction` and restrict to self-or-manager:

```ts
export const upsertAttendance = withAuthAction(
  upsertAttendanceSchema,
  async (user, data) => {
    if (data.playerId !== user.id) {
      const event = await db.query.matchSessions.findFirst({
        columns: { teamId: true },
        where: eq(matchSessions.id, data.matchSessionId),
      });
      if (!event || !(await canManageTeam(user.id, event.teamId)))
        return { success: false, error: { code: "FORBIDDEN" } };
    }
    // …existing upsert unchanged…
  },
);
```

If a call site turns out to be a **guest** path (no session), STOP condition — report it; guests are expected to go through `verifyGuestOTP`, not `upsertAttendance`.

**Verify**: `pnpm ts-check` → exit 0.

### Step 5: Gate `verifyPaymentProof`

In `src/actions/payment-verification.actions.ts`: the input is `paymentProofId` + `aiCheck`. After fetching the proof (existing code), resolve its payment → `matchReservationId`, then require the same `canActOnReservation` rule (add optional `guestAccessToken` to `verifyPaymentProofSchema` in `src/schemas/payments.schema.ts`). Export or move `canActOnReservation` into a shared location if importing from `payments.actions.ts` is awkward — a new `src/lib/reservation-access.ts` is acceptable; if you create it, add its path to your report.

Do NOT attempt to move AI inference server-side in this plan — that is a product decision (see plans/README.md "considered" notes). This step only ensures a stranger can't run prechecks against other people's proofs.

**Verify**: `pnpm ts-check` → exit 0.

### Step 6: Scope the Ably token per event

Change `src/app/api/ably/token/route.ts` to require `?eventId=<n>`:

1. Parse `eventId` from `new URL(req.url).searchParams`; 400 on missing/non-integer.
2. Reuse the participation check used by `src/actions/event-chat.actions.ts` (read that file; it enforces who may read/write event chat — confirmed participants + captain). If the check is not exported, export it from there.
3. On pass, issue capability `{ [`event-chat:${eventId}`]: ["subscribe", "history"] }`. On fail, 403.
4. Update the client (`src/hooks/use-event-chat.ts`) to append `eventId` to its `authUrl`.

**Verify**: `pnpm ts-check` → exit 0; `grep -n "event-chat:\*" src/app/api/ably/token/route.ts` → no matches.

### Step 7: Tests

Follow the mock pattern from Plan 001 (`vi.hoisted` + `vi.mock("@/db/client")`, mock `@/lib/auth` and `next/headers`). Create `src/actions/__tests__/payments.auth.test.ts` and `src/actions/__tests__/attendance.auth.test.ts`. Also mock `@/lib/posthog-server`, `@/lib/notifications` (or whichever module exports `notifyPaymentValidationRequired`), and any S3/email modules that throw at import.

Minimum cases:
1. `createPayment` — no session + no/wrong token → `FORBIDDEN`; matching `guestAccessToken` → proceeds; session user owning reservation → proceeds.
2. `submitPaymentProof` — stranger session (playerId mismatch, no token) → `FORBIDDEN`.
3. `upsertAttendance` — no session → `UNAUTHORIZED`; session user, `playerId === user.id` → proceeds; session user, other `playerId`, `canManageTeam` false → `FORBIDDEN`.
4. `managerRemoveParticipant` — session user, `canManageTeam` false → error containing "Sem permissão".
5. `verifyPaymentProof` — stranger → `FORBIDDEN`.

**Verify**: `pnpm test` → all pass (including Plan 001's tests).

## Test plan

Covered in Step 7 — ≥9 new cases across 2 files, modeled on `src/lib/__tests__/action-helpers.test.ts` from Plan 001.

## Done criteria

- [ ] `pnpm ts-check`, `pnpm lint`, `pnpm test`, `pnpm build` all exit 0
- [ ] `grep -n "event-chat:\*" src/app/api/ably/token/route.ts` → no matches
- [ ] Each of `managerUpdateParticipantStatus`, `managerRemoveParticipant`, `managerBlockParticipant` contains a `canManageTeam` call (grep)
- [ ] `createPayment`, `submitPaymentProof`, `requestPresignedUrl`, `verifyPaymentProof`, `upsertAttendance` each contain an authorization gate (manual read)
- [ ] New migration file with `guest_access_token` exists; no `db:push`/`db:migration` was executed
- [ ] Guest flow still compiles end-to-end: token returned by `verifyGuestOTP` is threaded to payment calls (trace imports)
- [ ] No files outside scope modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any excerpt in "Current state" doesn't match the live code (drift).
- You find a **guest/unauthenticated call site of `upsertAttendance`** — the self-or-manager gate would break it.
- `verifyGuestOTP`'s return value does not reach the payment components through props/state you can trace — do not invent a new client state store; report the gap.
- The event-chat participation check in `event-chat.actions.ts` doesn't exist or contradicts this plan's assumption (confirmed participants + captain).
- Threading `guestAccessToken` requires touching more than the 4 listed client files.

## Maintenance notes

- The guest token is a long-lived bearer stored in plaintext in `matchReservations`. Acceptable for scope (grants payment ops on one reservation), but if reservations ever expose more capability, hash it at rest and expire it.
- Reviewers should scrutinize: (1) the token is stripped before insert into `payments`; (2) `timingSafeEqual` length guard; (3) no manager path regressed for captains (co-captains with role `"manager"` must still pass).
- Follow-up deferred: server-side AI verification of proofs (replaces trusting client `aiCheck` — direction finding); OTP rate limiting is Plan 003.
