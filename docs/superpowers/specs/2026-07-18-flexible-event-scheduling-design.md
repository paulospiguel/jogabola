# Flexible Event Scheduling — Design

## Problem

Today, creating an event in Arena only supports a single fixed date/time. The
`recurrence` field already exists end-to-end (DB column, form state, edit
sheet) but is purely cosmetic — setting it to `"weekly"` or `"monthly"` just
labels a single `matchSessions` row; it never generates additional
occurrences. There is also no way to create a multi-day event (a `endsAt`
column already exists on `matchSessions` and is already threaded through
`createEvent()`, but no UI ever sets it).

The team wants two new capabilities alongside the existing fixed-date flow:

1. **Intervalo de datas** — a single event spanning multiple calendar days
   (e.g. a 3-day tournament or training camp).
2. **Recorrente** — the same weekday/time repeating weekly or monthly, up to
   a chosen end date, generating a real, independently-manageable event per
   occurrence.

## Non-goals

- No "edit/cancel whole series" operation. Every generated occurrence is a
  normal, independent event from the moment it's created — same edit/cancel
  flow as any event today. This intentionally avoids the
  "this event / this and following / all events" complexity of tools like
  Google Calendar.
- No indefinite/open-ended recurrence. A recurring series always has an
  explicit end date chosen at creation time; there is no background job that
  keeps generating future occurrences.
- No change to the Calendar page. It already renders every `matchSessions`
  row on its own date within the queried range — generated occurrences show
  up there with zero code changes.
- No combining "intervalo" and "recorrente" (a recurring series of multi-day
  events). Out of scope; the three schedule types are mutually exclusive.

## Architecture

### Schedule types

A new `scheduleType` selector in the create-event flow, one of:

- **`"fixed"`** (default, current behavior) — one `matchSessions` row,
  `startsAt` only.
- **`"range"`** — one `matchSessions` row with both `startsAt` and `endsAt`
  set, potentially days apart. Reuses the existing `endsAt` column; no
  schema change. Validated the same way at the action layer: `endsAt` must
  be after `startsAt`, and the span is capped at **90 days** (a sane ceiling
  for a training camp/tournament — well above any realistic use, guards
  against a fat-fingered end date). Exceeding it returns a validation error
  asking for an earlier end date, same pattern as the recurring cap below.
- **`"recurring"`** — **N independent `matchSessions` rows**, one per
  occurrence, generated in a single batch insert at creation time. Each row
  is bounded by a `recurrenceEndDate` chosen at creation time (used only to
  compute how many rows to generate — it is not persisted).

`scheduleType` itself is a create-flow-only concept; it does not become a
new column. Persistence continues to use the existing `recurrence` column
(`"once" | "weekly" | "monthly"`), plus one new column described below.

### Schema change

One new nullable column on `matchSessions`:

```ts
recurrenceGroupId: text("recurrence_group_id"), // uuid, nullable
```

All rows generated from the same recurring series share a
`recurrenceGroupId` (a `crypto.randomUUID()` generated once per series).
Rows created via `"fixed"` or `"range"` leave it `null`. This column has
exactly one consumer: collapsing the *upcoming* events list (see below). It
is not used for edit/cancel authorization, roster, attendance, or payments —
those all continue to scope strictly by `matchSessionId`, unchanged.

### Occurrence generation

Given a start date/time and a frequency:

- **Weekly:** each occurrence is `addWeeks(start, n)` for `n = 0, 1, 2, …`
- **Monthly:** each occurrence is `addMonths(start, n)` for `n = 0, 1, 2, …`

Both use `date-fns`, already a project dependency. Verified against the
installed version: `addMonths` clamps to the last valid day of a shorter
target month rather than overflowing (e.g. Jan 31 → Feb 28 → Mar 31, not
Jan 31 → Mar 3), which is the correct "same date each month" behavior for
this feature.

Generation stops at the first occurrence date that is **after**
`recurrenceEndDate` (the date the user picked as the series boundary — only
its calendar date matters, its time-of-day is ignored).

**Safety cap:** generation is capped at **104 occurrences** (covers a full
year weekly, or ~8 years monthly). If the requested range would exceed that,
`createEvent` returns a validation error asking for an earlier end date,
before touching the database.

### `createEvent` changes

`createEvent` (in `src/actions/match-sessions.actions.ts`) gains two new
optional inputs: `endDate?: Date` (already exists — just gets exposed via
UI for `"range"`) and, for `"recurring"`, `recurrenceFrequency?: "weekly" |
"monthly"` plus `recurrenceEndDate?: Date`.

When `recurrenceFrequency` is present, `createEvent`:
1. Validates `recurrenceEndDate > startDate` and the occurrence count ≤ 104.
2. Computes the full list of occurrence dates.
3. Generates one `recurrenceGroupId`.
4. Inserts all rows in a single `db.insert(matchSessions).values([...])`
   batch (same shape as the existing single-row insert, one row per
   occurrence, each with its own `slug` — the existing slug already
   incorporates the date and a random suffix, so per-occurrence slugs stay
   unique automatically). Every generated row's `recurrence` column is set
   to the chosen frequency (`"weekly"` or `"monthly"`) and shares the same
   `recurrenceGroupId`. For `"fixed"` and `"range"`, `recurrence` stays
   `"once"` (today's default) and `recurrenceGroupId` stays `null`.
5. Returns `{ success: true, data: <first-created-event> }` — the same
   response shape `createEvent` already returns for a single event, so the
   client's existing "redirect to the created event's page" behavior needs
   no change. (Internally all created rows are available if a future need
   arises, but the current UI only needs the first.)

### Events list collapsing (upcoming only)

`partitionEventsByDate` (in
`src/app/(mobile)/(protected)/arena/events/_utils/events-view.ts`) gets one
additional pure step applied only to its `upcoming` result: for events
sharing a non-null `recurrenceGroupId`, keep only the earliest one, drop the
rest. `past` is returned completely unchanged — every historical occurrence
keeps its own card, with its own roster/attendance/payment history, exactly
as today.

This is computed fresh from the full event list on every read, not a stored
flag. When the currently-shown occurrence of a series moves from `upcoming`
into `past` (its date passes), the next occurrence in the same
`recurrenceGroupId` is automatically the new earliest `upcoming` entry on
the very next fetch — no extra bookkeeping, no cron job.

The collapsed card behaves exactly like a normal event card: it shows the
next occurrence's own date/time, and clicking it opens that occurrence's own
detail page (roster, attendance, payments) — the same navigation as any
single event today. A small "recorrente" tag is added next to the existing
status badge when `recurrenceGroupId` is set, so it's visually distinguishable
from a one-off event.

### Edit sheet change

`EditEventSheet` currently has an editable `recurrence` `<Select>`
(`once`/`weekly`/`monthly`) that has always been non-functional (it only
ever relabels the single row being edited). Since every occurrence is now a
fully independent event with no series-level edit operation, this dropdown
is replaced with a **read-only badge** — shown only when the event's
`recurrenceGroupId` is set — reading "Parte de uma série semanal/mensal".
Editing and cancelling continue to affect only that one row, exactly as
today.

## Data flow summary

```
Create-event sheet
  scheduleType: fixed | range | recurring
        │
        ├─ fixed    → createEvent({ startDate })
        ├─ range    → createEvent({ startDate, endDate })
        └─ recurring→ createEvent({ startDate, recurrenceFrequency, recurrenceEndDate })
                            │
                            ▼
                     generate N occurrence dates (capped at 104)
                     generate 1 recurrenceGroupId
                     batch-insert N matchSessions rows
                            │
                            ▼
                     redirect to first occurrence's /arena/events/[id]

Events list (upcoming)          Events list (past)         Calendar
  partitionEventsByDate           partitionEventsByDate      queryEvents by date range
  + collapse by recurrenceGroupId   (unchanged)               (unchanged — every row
  → 1 card per series                                          shows on its own date)
```

## Testing approach

- **Pure logic, unit-tested (TDD):**
  - Occurrence-date generation function (weekly/monthly stepping, month-end
    clamping, cap enforcement, end-date-exclusive boundary).
  - `collapseUpcomingSeries` (or equivalent extension to
    `partitionEventsByDate`): grouping by `recurrenceGroupId`, keeping the
    earliest, leaving ungrouped events and `past` untouched.
- **Server action:** `createEvent`'s recurring path is exercised indirectly
  through the pure generation function above (kept separate and
  dependency-free so it doesn't need a DB in tests) plus a focused check
  that `createEvent` rejects a `recurrenceEndDate` that would exceed the
  104-occurrence cap.
- **Manual/browser verification:** create one event of each schedule type
  end-to-end, confirm the events list shows exactly one card for a fresh
  recurring series, confirm the calendar shows every generated occurrence,
  confirm editing/cancelling one occurrence doesn't affect its siblings.

## i18n

New/changed user-facing strings, all four locale files (`pt.json` base,
mirrored in `en.json`, `es.json`, `fr.json`):

- `arenaCreateEvent.labels.scheduleType` ("Tipo de agendamento")
- `arenaCreateEvent.scheduleType.fixed` / `.range` / `.recurring`
- `arenaCreateEvent.labels.until` ("Até")
- `arenaCreateEvent.labels.repeatUntil` ("Repete até")
- `arenaCreateEvent.placeholders.selectEndDate`
- `arenaCreateEvent.confirm.rangeSummary` ("{start} → {end}")
- `arenaCreateEvent.confirm.recurringSummary` ("{frequency}, até {end} · {count} jogos serão criados")
- `arenaCreateEvent.errors.RECURRENCE_TOO_MANY_OCCURRENCES`
- `arenaCreateEvent.errors.RECURRENCE_END_BEFORE_START`
- `arenaEvents.badges.recurring` ("Recorrente")
- `arenaCreateEvent.edit.partOfSeries` ("Parte de uma série {frequency}")

`arenaCreateEvent.recurrence.once/weekly/monthly` already exist and are
reused as-is for the frequency select.
