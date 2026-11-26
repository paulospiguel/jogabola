# Team Staff, Roster & Ownership Transfer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split team management (staff with granular permissions) from the athlete roster, make the owner an opt-in athlete, replace co-captain with staff, and let the owner transfer the team.

**Architecture:**
- Ownership stays in `teams.owner_id`.
- A new `team_staff` table holds non-owner staff with `permissions text[]`, validated against a TypeScript catalog and a DB check constraint.
- `team_members` becomes roster-only.
- One server module, `src/lib/team-authz.ts`, answers "can this user do X on this team" and replaces `team-access.ts` / `team-capabilities.ts`.
- An append-only `team_staff_events` table audits every staff/ownership change.
- Transfers live in `team_ownership_transfers`, with a hashed token and a single transactional accept.

**Tech Stack:** Next.js 16 App Router, Server Actions (`withAuthAction`), Drizzle ORM + Postgres 17, better-auth, next-intl, Vitest, nodemailer/Resend via `src/lib/email.ts`.

**Spec:** `docs/superpowers/specs/2026-11-26-team-staff-and-roster-design.md`

## Global Constraints

- **UI copy:** all of it goes through `next-intl`. Every new key goes into `src/locales/pt.json`, `en.json`, `es.json` and `fr.json`. PT-PT is the base.
- **No hardcoded text** in components.
- **Server Actions only:** no new REST routes.
- **Mutations:**
  - Authorize on the server via `team-authz.ts`.
  - Read `teamId` from the persisted record for by-id operations.
  - Treat any client-side permission as presentation-only.
- **Permission keys (exact):** `events.manage`, `attendance.manage`, `roster.manage`, `payments.manage`, `communication.manage`, `match.manage`.
- **Staff titles (exact):** `coach`, `director`, `finance`, `secretary`, `other`.
- **Title presets:**
  - coach → events, attendance, match
  - director → all six
  - finance → payments
  - secretary → events, attendance, communication
  - other → none
- **Owner-only (no toggle):** manage staff/permissions, transfer, delete team, billing/plan, ADR 0005 competitive actions.
- **Migrated co-captains (`role='manager'`):** title `other`, permissions `{events.manage, attendance.manage, payments.manage, communication.manage, roster.manage}`.
- **Existing `team_members` rows stay in the roster** (owners included). `role` is normalized to `player`, and the column is kept.
- **Transfer:**
  - Expires 7 days after creation.
  - At most one `pending` per team.
  - Confirmation requires typing the exact team name.
  - Token stored only as a SHA-256 hash.
  - Email recipients must have a verified email to accept.
- **On transfer accept:**
  - Set `stripeEnabled`, `mbwayEnabled`, `transferEnabled` to `false` on `team_payment_settings` (`cashEnabled` untouched).
  - Refuse with `TEAM_LIMIT_REACHED` if `canCreateTeam(recipientPlan, recipientOwnedCount)` is false; the request stays `pending`.
- **Every mutation** that changes what `/arena` layout shows calls `revalidatePath("/arena", "layout")`.
- **Microinteractions:** `.press`/`.btn-press` on clickables. Empty states use icon + title + sub + CTA. Icons are stroke-based, never emoji.

## Review Focus

1. **Owner who is not an athlete:**
   - Must keep full access everywhere: `/arena` gate, team switcher, profile team list, event pages, payments.
   - Test: `getTeamAccess` for owner with no `team_members` row → `canView=true`, all permissions true (Task 2). Layout gate covered in Task 7.
2. **Staff member removed from the roster:**
   - Keeps staff access and permissions.
   - Test: in Task 5, `removePlayerFromRoster` on a staff member by a non-owner → `FORBIDDEN`; by owner → roster row deleted and `team_staff` row intact.
3. **Double submit / retry:**
   - `promoteToStaff` twice, `setMyAthleteStatus(true)` twice and `acceptOwnershipTransfer` twice each produce one effect.
   - Tests in Tasks 6 and 9.
4. **Old owner after transfer:**
   - Old owner with an athlete row keeps roster access only (no management).
   - Old owner without a row loses access, and their sessions' `team_id` for that team is cleared.
   - Test in Task 9.
5. **Athlete calling formerly-open mutations:**
   - Calling `addPlayerToRoster`, `upsertTeamPaymentSettings`, `balanceTeams` (team-balancer) without permission → `FORBIDDEN`, no write.
   - Tests in Tasks 4 and 5.

---

## Phase 1 — Separate staff and roster

### Task 1: ADR 0006 and domain glossary

**Files:**
- Create: `docs/adr/0006-team-staff-and-roster.md`
- Modify: `.agents/context/CONTEXT.md` (Organização & Logística glossary)

**Interfaces:** none (docs).

- [ ] **Step 1: Write ADR 0006.**
  - Format: same as `docs/adr/0005-club-calendar-authorization.md` (Estado: Aceite, Contexto, Decisão, Consequências, Verificação), in PT-PT.
  - Content: spec §5–§9 decisions — tables, permission catalog, owner-only list, migration rule, transfer rules incl. payments/plan-limit.
  - State that it fulfils ADR 0005's prerequisite of protecting `team_members` writes.
- [ ] **Step 2: Update the CONTEXT.md glossary.**
  - Replace **Capitão / Organizador** with **Dono** (`teams.owner_id`; gere tudo; atleta opcional).
  - Add **Staff** (membro com cargo e privilégios atribuídos pelo dono) and **Transferência de equipa**.
  - **Plantel** = só atletas (`team_members`).
  - Remove co-capitão.
- [ ] **Step 3: Commit**

```bash
git add docs/adr/0006-team-staff-and-roster.md .agents/context/CONTEXT.md
git commit -m "docs: ADR 0006 team staff, roster and ownership transfer"
```

### Task 2: Permission catalog and authorization module

**Files:**
- Create: `src/lib/team-authz.ts`, `src/lib/staff-permissions.ts` (client-safe constants, no DB import)
- Test: `src/lib/__tests__/team-authz.test.ts`, `src/lib/__tests__/staff-permissions.test.ts`

**Interfaces:**
- Produces (`staff-permissions.ts`):
  - `STAFF_PERMISSIONS` — readonly tuple of the 6 keys.
  - `type StaffPermission`.
  - `STAFF_TITLES` — readonly tuple of the 5 titles.
  - `type StaffTitle`.
  - `TITLE_PRESETS: Record<StaffTitle, StaffPermission[]>`.
  - `LEGACY_MANAGER_PERMISSIONS: StaffPermission[]`.
  - `isStaffPermission(v: string): v is StaffPermission`.
- Produces (`team-authz.ts`, server-only):
  - `type TeamAccess = { teamExists: boolean; isOwner: boolean; isAthlete: boolean; staff: { title: StaffTitle; permissions: StaffPermission[] } | null }`
  - `getTeamAccess(userId: string, teamId: number): Promise<TeamAccess>`
  - `accessCanView(a: TeamAccess): boolean`
  - `accessCan(a: TeamAccess, p: StaffPermission): boolean`
  - `isStaffOrOwner(a: TeamAccess): boolean`
  - `canViewTeam(userId, teamId): Promise<boolean>`
  - `can(userId, teamId, p): Promise<boolean>`
  - `isTeamOwner(userId, teamId): Promise<boolean>`
  - `getAccessibleTeamIds(userId): Promise<number[]>` (owned ∪ staff ∪ roster)

- [ ] **Step 1: Write failing tests for the pure functions.**
  - `staff-permissions.test.ts`:
    - `TITLE_PRESETS.director` equals `STAFF_PERMISSIONS`.
    - `TITLE_PRESETS.other` is `[]`.
    - `LEGACY_MANAGER_PERMISSIONS` contains exactly events, attendance, payments, communication, roster.
    - `isStaffPermission("billing.manage") === false`.
  - `team-authz.test.ts`:
    - `accessCan({teamExists:true,isOwner:true,isAthlete:false,staff:null}, "payments.manage") === true`.
    - Staff with `["events.manage"]`: `accessCan(..., "payments.manage") === false` and `accessCan(..., "events.manage") === true`.
    - Athlete-only: `accessCanView` true, `accessCan` false for all keys.
    - `teamExists:false`: everything false.
- [ ] **Step 2: Run** `pnpm vitest run src/lib/__tests__/team-authz.test.ts src/lib/__tests__/staff-permissions.test.ts`. Expected: FAIL (modules missing).
- [ ] **Step 3: Implement** both modules.
  - `getTeamAccess` uses one query: `teams` left-joined to `team_staff` and `team_members` on `(team_id, user_id)`.
  - Unknown permission strings read from the DB are dropped via `isStaffPermission`.
- [ ] **Step 4: Add DB-mocked tests for `getTeamAccess`.**
  - Mock pattern from `src/actions/__tests__/attendance.auth.test.ts`.
  - Cases: owner without roster row → `isOwner:true,isAthlete:false`; nonexistent team → `teamExists:false`.
  - Run: PASS.
- [ ] **Step 5: Commit**

```bash
git add src/lib/staff-permissions.ts src/lib/team-authz.ts src/lib/__tests__/
git commit -m "feat(authz): team permission catalog and access resolver"
```

### Task 3: Schema and data migration

**Files:**
- Create: `src/db/schema/team-staff.ts`
- Modify:
  - `src/db/schema/index.ts` (export the new tables)
  - `src/db/migrations/relations.ts` if relations are declared there
- Create: `src/db/migrations/current/0001_team_staff.sql` (via `pnpm db:generate`, then append the data SQL)
- Modify: `scripts/test-db-migrations.mjs` (seed + assertions)

**Interfaces:**
- Consumes: `STAFF_PERMISSIONS`, `STAFF_TITLES` (Task 2).
- Produces:
  - Drizzle tables `teamStaff` and `teamStaffEvents`, with columns exactly as spec §7.
  - Unique `team_staff_team_user_idx (team_id, user_id)`.
  - Check `team_staff_permissions_check`: `permissions <@ ARRAY[<6 keys>]::text[]`.
  - Check `team_staff_title_check`: `title IN (<5 titles>)`.
  - `team_staff_events.type` is text, validated in code.
  - `team_ownership_transfers` is added in Task 9, not here.

- [ ] **Step 1: Write the failing migration assertions** in `scripts/test-db-migrations.mjs`.
  - Add to `seedArenaData` (inserted before `db:migration` runs on the legacy fixture path):
    - a second user `'manager-test'` with a `team_members` row `role 'manager'` on team 1;
    - a third user `'athlete-test'` with role `'player'`.
  - After migration, assert:
    - `team_staff` has exactly one row `(team_id 1, user_id 'manager-test', title 'other')` with permissions equal to the 5 legacy keys;
    - every `team_members` row still exists, including `captain-test`, `manager-test`, `athlete-test`;
    - all `role` values equal `'player'`;
    - no `team_staff` row exists for `captain-test`.
  - Add `"team_staff"` to the tables checked for catalog.
- [ ] **Step 2: Run against the local Docker Postgres.** Expected: FAIL (`team_staff` missing).

```bash
docker compose exec -e JOGABOLA_TEST_DATABASE_URL=postgresql://jogabola:jogabola-local-only@postgres:5432/postgres app node scripts/test-db-migrations.mjs
```

- [ ] **Step 3: Implement the schema and migration.**
  - Write `team-staff.ts`, then `pnpm db:generate` (with `DATABASE_URL` set to the local DB).
  - Rename the output to `0001_team_staff.sql`, keeping `_journal.json` consistent.
  - Append idempotent data SQL:
    - `INSERT INTO team_staff (team_id,user_id,title,permissions,created_by) SELECT tm.team_id, tm.player_id, 'other', ARRAY[...5 keys], t.owner_id FROM team_members tm JOIN teams t ON t.id=tm.team_id WHERE tm.role='manager' AND tm.player_id <> t.owner_id ON CONFLICT DO NOTHING;`
    - `UPDATE team_members SET role='player' WHERE role <> 'player';`
- [ ] **Step 4: Run** the Step 2 command again, then `pnpm db:migration` on the dev DB. Expected: PASS; `Applied 1 migration`.
- [ ] **Step 5: Commit**

```bash
git add src/db/schema src/db/migrations scripts/test-db-migrations.mjs
git commit -m "feat(db): team_staff and staff audit tables; migrate co-captains to staff"
```

### Task 4: Swap authorization in events, attendance, notices, balancer, payments

**Files:**
- Modify:
  - `src/actions/match-sessions.actions.ts`
  - `src/actions/attendance.actions.ts`
  - `src/actions/notices.actions.ts`
  - `src/actions/team-balancer.actions.ts`
  - `src/actions/payments/payment-lifecycle.actions.ts`
  - `src/actions/payments/payment-proofs.actions.ts`
  - `src/actions/payments/payment-verification.actions.ts`
  - `src/actions/payments/payments.actions.ts`
  - `src/actions/payments/payment-queries.actions.ts`
  - `src/actions/team-payment-settings.actions.ts`
  - `src/actions/event-chat.actions.ts`
- Test:
  - `src/actions/__tests__/attendance.auth.test.ts` (update mocks)
  - new `src/actions/__tests__/payment-settings.auth.test.ts`
  - new `src/actions/__tests__/team-balancer.auth.test.ts`

**Interfaces:**
- Consumes: `can`, `canViewTeam`, `getTeamAccess`, `accessCan` (Task 2).

Mapping (replace every `canManageTeam`/`userIsTeamOwner`/`userCanAccessTeam` call):

| File | Check |
|---|---|
| match-sessions (create/update/cancel/recurrence) | `can(..., "events.manage")` |
| match-sessions reads | `canViewTeam`; `getAccessibleTeamIds` from team-authz |
| attendance (manager block/remove/set others) | `can(..., "attendance.manage")` |
| notices create/delete | `can(..., "communication.manage")` |
| team-balancer exported actions | `can(..., "match.manage")` — today they have none |
| payment-lifecycle/proofs/verification/payments mutations | `can(..., "payments.manage")` |
| `upsertTeamPaymentSettings` | `can(..., "payments.manage")` (was any member) |
| payment reads (`getTeamPaymentSettings`, queries) | `canViewTeam` |
| event-chat access | owner ∨ `events.manage` staff ∨ confirmed attendee |

- [ ] **Step 1: Write the failing tests.**
  - `payment-settings.auth.test.ts`:
    - `upsertTeamPaymentSettings` by a user whose `can` → false returns `{success:false,error:{code:"FORBIDDEN"}}`, and `db.insert` is not called.
    - With `can` → true, it writes.
  - `team-balancer.auth.test.ts`: same two cases for each exported mutation.
  - `attendance.auth.test.ts`: change the mock target from `@/lib/team-access`/`canManageTeam` to `@/lib/team-authz`/`can`, and assert it was called with `"attendance.manage"`.
- [ ] **Step 2: Run** `pnpm vitest run src/actions/__tests__`. Expected: new tests FAIL.
- [ ] **Step 3: Apply the mapping table.**
  - Return code for permission failures: `FORBIDDEN`.
  - Payment-proof notification fan-out (`payment-proofs.actions.ts:68` `managerId: teams.ownerId`): notify the owner plus every `team_staff` user whose permissions include `payments.manage`.
  - Event chat helper (`event-chat.actions.ts:48-51`): allow owner or staff with `events.manage`.
- [ ] **Step 4: Run** `pnpm vitest run && pnpm ts-check`. Expected: PASS.
- [ ] **Step 5: Commit**

```bash
git add src/actions
git commit -m "feat(authz): permission-based checks for events, attendance, notices, balancer, payments"
```

### Task 5: Roster actions and gaps

**Files:**
- Modify: `src/actions/teams.actions.ts`, `src/schemas/teams.schema.ts`, `src/lib/event-roster-access.ts` (no change in meaning; confirm it reads roster only)
- Test: `src/actions/__tests__/teams.roster.auth.test.ts`

**Interfaces:**
- Consumes: Task 2 API.
- Produces:
  - `addTeamMember` no longer exported as a Server Action; it is moved to `src/lib/roster.ts` as `insertRosterMember(teamId: number, userId: string, position?: string | null): Promise<void>`, used internally.
  - Its `role` input is removed.

- [ ] **Step 1: Write the failing tests** (`teams.roster.auth.test.ts`).
  - `addPlayerToRoster` by an athlete without `roster.manage` → `FORBIDDEN`, no insert.
  - `removePlayerFromRoster`:
    - target a plain athlete by staff with `roster.manage` → deletes the roster row;
    - target the owner, by anyone → `CANNOT_MODIFY_OWNER`;
    - target a staff member, by a non-owner with `roster.manage` → `FORBIDDEN`;
    - target a staff member, by the owner → deletes the roster row; the `team_staff` delete is not called.
  - `sendRosterPlayerEmail` without `roster.manage` → `FORBIDDEN`.
  - `@/actions/teams.actions` no longer exports `addTeamMember`: `expect("addTeamMember" in mod).toBe(false)`.
- [ ] **Step 2: Run**: FAIL.
- [ ] **Step 3: Implement.**
  - Gate the three actions with `can(..., "roster.manage")`.
  - Owner/staff target rules come from `getTeamAccess(targetId, teamId)`.
  - Drop the `admin`→`manager` branch in `addPlayerToRoster`.
  - `getMyTeams`: build the summary from owned ∪ staff ∪ roster. DTO fields:
    - `isOwner`, `isAthlete`, `staffTitle`, `permissions`;
    - `canManage = isOwner || staff != null` (presentation);
    - `membershipRole` derived as `"owner" | "staff" | "player"`.
  - Update `src/types/teams.ts` `TeamRole` to `"owner" | "staff" | "player"`.
  - Update consumers to compile: `use-teams.ts`, `dashboard-cockpit.ts`, `events-view.ts`, `arena-dashboard.tsx`.
  - Delete `src/lib/team-access.ts` and `src/lib/team-capabilities.ts` once no imports remain.
- [ ] **Step 4: Run** `pnpm vitest run && pnpm ts-check && pnpm lint`. Expected: PASS.
- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(roster): gate roster writes by roster.manage; remove legacy team-access"
```

### Task 6: Staff and athlete-status actions

**Files:**
- Create: `src/actions/team-staff.actions.ts`, `src/schemas/team-staff.schema.ts`, `src/lib/staff-audit.ts`
- Modify: `src/actions/teams.actions.ts` (`createTeam` no roster insert; delete `setCoCaptain` and `setCoCaptainSchema`)
- Test: `src/actions/__tests__/team-staff.actions.test.ts`

**Interfaces:**
- Consumes: Task 2 API, `teamStaff`, `teamStaffEvents` (Task 3).
- Produces:
  - `recordStaffEvent(tx, { teamId, actorUserId, subjectUserId, type, payload? }): Promise<void>`
  - `setMyAthleteStatus({ teamId: number, isAthlete: boolean })` → `ActionResult<{ isAthlete: boolean }>`
    - Allowed for owner or staff only. A plain athlete opting out uses `removePlayerFromRoster` rules — out of scope.
  - `promoteToStaff({ teamId, userId, title: StaffTitle, permissions: StaffPermission[] })` → `ActionResult<{ userId: string }>`
  - `updateStaffMember({ teamId, userId, title?, permissions? })` → `ActionResult<{ userId: string }>`
  - `demoteStaff({ teamId, userId })` → `ActionResult<{ userId: string }>`
  - `getTeamStaff({ teamId })` → `ActionResult<Array<{ userId: string; name: string; image: string | null; title: StaffTitle | "owner"; permissions: StaffPermission[]; isAthlete: boolean }>>`
    - Owner first; readable by owner/staff only.
  - Error codes: `FORBIDDEN`, `TEAM_NOT_FOUND`, `NOT_AN_ATHLETE`, `CANNOT_MODIFY_OWNER`, `NOT_STAFF`.

- [ ] **Step 1: Write the failing tests.**
  - `createTeam` inserts no `team_members` row.
  - `promoteToStaff`:
    - by non-owner → `FORBIDDEN`;
    - target not in roster → `NOT_AN_ATHLETE`;
    - target is owner → `CANNOT_MODIFY_OWNER`;
    - success inserts `team_staff` with `onConflictDoNothing` and records a `promoted` event;
    - calling twice yields one row (insert uses `onConflictDoNothing`; second returns success).
  - `demoteStaff`: deletes the `team_staff` row only (no `team_members` delete); records `demoted`; on a non-staff target → `NOT_STAFF`.
  - `updateStaffMember` with permission `"billing.manage"` → `VALIDATION_ERROR`.
  - `setMyAthleteStatus`:
    - `(true)` twice → one roster row (`onConflictDoNothing`);
    - `(false)` deletes only the caller's row;
    - plain athlete caller → `FORBIDDEN`.
- [ ] **Step 2: Run**: FAIL.
- [ ] **Step 3: Implement.**
  - Each mutation runs in `db.transaction`, writes its audit row via `recordStaffEvent` and calls `revalidatePath("/arena", "layout")`.
  - Zod schemas use `z.enum(STAFF_TITLES)` and `z.array(z.enum(STAFF_PERMISSIONS))`, de-duplicated.
- [ ] **Step 4: Run** `pnpm vitest run && pnpm ts-check`. Expected: PASS.
- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "feat(staff): promote, demote, update staff and athlete opt-in actions"
```

### Task 7: Phase 1 UI

**Files:**
- Modify:
  - `src/components/arena/create-team-sheet.tsx`
  - `src/app/(mobile)/(protected)/arena/profile/page.tsx`
  - `src/app/(mobile)/(protected)/arena/profile/_components/profile-teams.tsx`
  - `src/app/(mobile)/(protected)/arena/squads/player/[id]/page.tsx` (replace co-captain toggle)
  - `src/app/(mobile)/(protected)/arena/events/[id]/page.tsx:64`
  - `src/app/(mobile)/(protected)/arena/layout.tsx` (gate uses `getAccessibleTeamIds(user.id).length > 0`)
  - `src/locales/{pt,en,es,fr}.json`
- Create: `src/components/arena/promote-staff-sheet.tsx`

**Interfaces:**
- Consumes: Task 6 actions; `TITLE_PRESETS`, `STAFF_TITLES` (Task 2).

- [ ] **Step 1: Create-team success screen.**
  - Replace the auto-close (`setTimeout(onClose, 2000)`) with a question:
    - Title `arenaCreateTeam.athletePrompt.title` = "Queres fazer parte do plantel de atletas?"
    - Sub `arenaCreateTeam.athletePrompt.sub` = "Podes mudar isto mais tarde no teu perfil."
    - Buttons `athletePrompt.yes` = "Sim, quero jogar" and `athletePrompt.no` = "Agora não".
  - "Yes" calls `setMyAthleteStatus({teamId, isAthlete:true})`; on error, show the localized error. Both buttons close afterwards.
- [ ] **Step 2: Profile.**
  - `profile/page.tsx` lists teams from owned ∪ staff ∪ roster (reuse `getMyTeams` logic or `getAccessibleTeamIds` + join), with `isAthlete` and `isOwnerOrStaff`.
  - `profile-teams.tsx` shows a switch `profilePage.athleteToggle` = "Sou atleta nesta equipa" for teams where `isOwnerOrStaff`.
  - Toggle is optimistic, with rollback and a toast on error.
  - Member count counts roster rows only.
- [ ] **Step 3: Player page.**
  - The co-captain toggle becomes:
    - "Promover a staff" (owner only, target not staff) → opens `promote-staff-sheet`, with a title select whose permission chips are pre-filled from `TITLE_PRESETS` and editable, and a "Promover" button;
    - "Remover do staff" (owner only, target is staff) → confirm, then `demoteStaff`.
  - Remove all `coCaptain`/`co-captain`/`manager: "Co-capitão"` keys from all four locales.
  - Add the `teamStaff.*` keys: title labels for the 5 titles, permission labels for the 6 keys, actions, errors for each error code.
- [ ] **Step 4: Event page.** `canEdit = await can(user.id, event.teamId, "events.manage")`.
- [ ] **Step 5: Verify.**
  - `pnpm lint && pnpm ts-check && pnpm test` (includes `src/lib/__tests__/arena-locale-contract.test.ts`, which must pass).
  - Then, in the browser at `localhost:3000` with a fresh test account (OTP via Mailpit `localhost:8025`):
    - create a team → prompt shows; choose "Agora não" → team appears; no "Cria uma equipa primeiro" modal; squad empty;
    - toggle athlete on in profile → appears in squad.
- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "feat(ui): owner athlete opt-in, staff promotion replaces co-captain"
```

## Phase 2 — Granular privileges UI

### Task 8: Staff section and permission editing

**Files:**
- Create:
  - `src/app/(mobile)/(protected)/arena/staff/page.tsx`
  - `src/app/(mobile)/(protected)/arena/staff/_components/staff-list.tsx`
  - `src/app/(mobile)/(protected)/arena/staff/_components/staff-member-sheet.tsx`
- Modify:
  - `src/components/arena/sidebar.tsx`, `src/components/arena/bottom-nav.tsx` (or the team menu) — "Staff" entry, shown when `isOwner || staff`
  - squad list item component (staff title badge)
  - locales
- Test: `src/app/(mobile)/(protected)/arena/staff/_utils/staff-view.test.ts` — a pure mapper `toStaffRows(data, viewerIsOwner)` that marks rows editable only when `viewerIsOwner` and the row is not the owner.

**Interfaces:**
- Consumes: `getTeamStaff`, `updateStaffMember`, `demoteStaff` (Task 6).

- [ ] **Step 1: Write the failing test.**
  - `toStaffRows`: owner row first and never editable.
  - Staff rows editable only when `viewerIsOwner`.
  - Permission labels ordered as `STAFF_PERMISSIONS`.
- [ ] **Step 2: Run**: FAIL. **Step 3:** implement mapper and UI.
  - The page is a server component: it calls `getTeamStaff` for the active team; staff/owner only, otherwise `notFound()`.
  - The sheet edits title (re-applies the preset only when the owner taps "Aplicar sugestão") and permission switches.
  - Saving calls `updateStaffMember`.
  - Empty state when only the owner exists: icon + "Ainda não tens staff" + sub + CTA "Ver plantel".
  - Desktop: list + side drawer. Mobile: full-screen sheet.
- [ ] **Step 4: Verify.**
  - `pnpm lint && pnpm ts-check && pnpm test`.
  - Browser: promote an athlete as `finance` → only "Pagamentos" on.
  - As that user, create event → `FORBIDDEN` toast; validate a payment proof → allowed.
- [ ] **Step 5: Commit** `feat(staff): staff section with granular permission editing`.

## Phase 3 — Ownership transfer

### Task 9: Transfer schema and actions

**Files:**
- Create: `src/db/schema/team-ownership-transfers.ts`, migration `src/db/migrations/current/0002_team_ownership_transfers.sql`, `src/actions/team-transfer.actions.ts`, `src/schemas/team-transfer.schema.ts`
- Modify: `scripts/test-db-migrations.mjs` (table present in catalog)
- Test: `src/actions/__tests__/team-transfer.actions.test.ts`

**Interfaces:**
- Consumes: Task 2, Task 6 `recordStaffEvent`, `canCreateTeam`/`normalizePlanTier` from `src/lib/plan-limits.ts`, `sendEmail` from `src/lib/email.ts`.
- Produces:
  - Table: columns as spec §7; partial unique index `team_ownership_transfers_one_pending_idx ON (team_id) WHERE status='pending'`.
  - `requestOwnershipTransfer({ teamId, toUserId?: string, toEmail?: string, confirmTeamName: string })` → `ActionResult<{ transferId: number; expiresAt: Date }>`
    - Exactly one of `toUserId`/`toEmail`.
    - `toUserId` must be a roster or staff member.
    - Email is normalized lowercase.
  - `cancelOwnershipTransfer({ teamId })` → `ActionResult<{ cancelled: true }>`
  - `acceptOwnershipTransfer({ token })` → `ActionResult<{ teamId: number }>`
  - `declineOwnershipTransfer({ token })` → `ActionResult<{ declined: true }>`
  - `getTransferByToken({ token })` → `ActionResult<{ teamName: string; fromName: string; expiresAt: Date; status: string }>`
  - `getPendingTransfer({ teamId })` → owner view.
  - `getMyIncomingTransfers()` → `ActionResult<Array<{ transferId: number; teamName: string; fromName: string; expiresAt: Date }>>` — pending transfers where the caller is `to_user_id` or matches a verified `to_email`.
  - `acceptOwnershipTransferById({ transferId })` / `declineOwnershipTransferById({ transferId })` — same rules as the token variants, authorized by recipient identity; both paths share one internal `acceptTransfer(transferRow, userId)`.
  - Error codes: `FORBIDDEN`, `TEAM_NAME_MISMATCH`, `TRANSFER_ALREADY_PENDING`, `TRANSFER_NOT_FOUND`, `TRANSFER_EXPIRED`, `TRANSFER_NOT_FOR_YOU`, `EMAIL_NOT_VERIFIED`, `TEAM_LIMIT_REACHED`, `CANNOT_TRANSFER_TO_SELF`.
  - Token: 32 random bytes, base64url; store `sha256` hex; never log it.

- [ ] **Step 1: Write the failing tests.**
  - Request:
    - non-owner → `FORBIDDEN`;
    - wrong name (case-sensitive trim compare) → `TEAM_NAME_MISMATCH`;
    - second request while pending → `TRANSFER_ALREADY_PENDING`;
    - to self → `CANNOT_TRANSFER_TO_SELF`;
    - success stores a hash, not the token, and `sendEmail` is called with a link containing the token.
  - Accept:
    - other user → `TRANSFER_NOT_FOR_YOU`;
    - email recipient with `emailVerified=false` → `EMAIL_NOT_VERIFIED`;
    - `expires_at` past → `TRANSFER_EXPIRED` and status updated to `expired`;
    - recipient at plan limit → `TEAM_LIMIT_REACHED` and status stays `pending`.
  - Accept success, in one transaction:
    - `teams.owner_id` = recipient;
    - recipient `team_staff` row deleted;
    - old owner has no `team_staff` row;
    - old owner roster row untouched if present;
    - payment settings `stripeEnabled/mbwayEnabled/transferEnabled=false` and `cashEnabled` unchanged;
    - old owner's `session.team_id` for that team set to null only if the old owner has no roster row;
    - status `accepted`;
    - `ownership_transfer_accepted` event recorded.
  - Accept twice → second returns `{success:true}` with no second update (status already accepted for the same recipient).
  - Concurrent: the accept transaction uses `SELECT ... FOR UPDATE` on the transfer row (assert the query builder `.for("update")` is used).
  - `acceptOwnershipTransferById` by a non-recipient → `TRANSFER_NOT_FOR_YOU`.
  - `getTransferByToken` on an expired pending row marks it `expired` and returns status `expired`.
- [ ] **Step 2: Run**: FAIL. **Step 3:** implement; migration via `pnpm db:generate`, renamed to `0002_...`.
- [ ] **Step 4: Run** `pnpm vitest run && pnpm ts-check` and the migration test command from Task 3. Expected: PASS.
- [ ] **Step 5: Commit** `feat(transfer): team ownership transfer with hashed token and transactional accept`.

### Task 10: Transfer UI and email

**Files:**
- Create:
  - `src/components/emails/team-transfer-email.tsx`
  - `src/app/(mobile)/transfer/[token]/page.tsx`
  - `src/app/(mobile)/(protected)/arena/staff/_components/transfer-team-sheet.tsx`
  - `src/components/arena/pending-transfer-card.tsx`
- Modify: `src/lib/email.ts` (add `sendTeamTransferEmail`, following the existing template pattern), staff page (entry "Transferir equipa", owner only), arena dashboard (card for a recipient with a pending transfer), locales.

**Interfaces:**
- Consumes: Task 9 actions.

- [ ] **Step 1: Email and token page.**
  - Email template (pt default, follows `auth-otp-email.tsx` style): team name, sender name, expiry date, CTA link `${NEXT_PUBLIC_APP_URL}/transfer/${token}`.
  - `/transfer/[token]`:
    - not logged in → redirect to `/auth?next=/transfer/<token>`;
    - logged in → shows `getTransferByToken` data with "Aceitar" and "Recusar", and error states for every Task 9 code;
    - `TEAM_LIMIT_REACHED` shows the upgrade CTA (reuse `arenaCreateTeam.upgradeCta`).
- [ ] **Step 2: Transfer sheet (owner).**
  - Pick a member (roster ∪ staff, excluding self) or type an email.
  - Warnings:
    - "Vais perder todos os privilégios; se não és atleta, perdes o acesso à equipa."
    - "Os métodos de pagamento (MB WAY, transferência, Stripe) ficam desativados até o novo dono os configurar."
  - Input "Escreve o nome da equipa para confirmar"; the submit is disabled until it matches.
  - Pending state shows recipient + expiry + "Cancelar transferência".
- [ ] **Step 2b: In-app card.** For a logged-in recipient, the dashboard shows `pending-transfer-card` from `getMyIncomingTransfers()`. Because the token is hashed, its Aceitar/Recusar buttons call `acceptOwnershipTransferById` / `declineOwnershipTransferById` (Task 9) directly.
- [ ] **Step 3: Verify.**
  - `pnpm lint && pnpm ts-check && pnpm test && pnpm build`.
  - Browser with two test accounts: owner A transfers to B by email → email in Mailpit → B accepts → B is owner; A has no Staff entry; payment methods off.
- [ ] **Step 4: Commit** `feat(transfer): transfer sheet, email, accept page and in-app card`.

### Task 11: Final QA

- [ ] **Step 1:** Dispatch two read-only reviewers in parallel, per `docs/agents/qa-subagents.md`:
  - `qa-integration-database` scoped to `src/lib/team-authz.ts`, `src/actions/team-*.ts`, `src/actions/teams.actions.ts`, migrations;
  - `qa-journeys-ui` scoped to create team → prompt, profile toggle, staff section, transfer flow, i18n in all 4 locales, mobile + desktop.
- [ ] **Step 2:** Fix confirmed findings, each with a test. Run `pnpm lint && pnpm ts-check && pnpm test && pnpm build` → all green.
- [ ] **Step 3:** Commit `fix: address QA findings for team staff and transfer`.
