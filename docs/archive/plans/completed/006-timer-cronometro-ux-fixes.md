# Plan 006: Fix unconfirmed destructive actions, dead-click states, and ambiguous team tags in `/timer`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a99b7cf..HEAD -- src/components/timer`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1 (Steps 1–2 are effectively P0 — unconfirmed data loss in the primary user flow)
- **Effort**: M (Steps 1–5 ≈ 1 day; Step 6 is a maintainer product decision, not estimated)
- **Risk**: LOW (isolated to `/timer`, a standalone tool not wired into `matchSessions`/stats per `plans/README.md` audit notes)
- **Depends on**: none
- **Category**: ux/correctness
- **Planned at**: commit `a99b7cf`, 2026-07-13, branch `releases/jogabola-teams/release02`
- **Source**: manual QA pass (desktop + 390px mobile viewport) against `/timer`, cross-checked against source in this repo

## Why this matters

`/timer` is the sideline tool a coach uses live, on a phone, to run a match or training clock. Manual QA found two ways to end a live match with a single, unconfirmable tap — a coach 40 minutes into a match can lose the whole session (score, cards, timeline) by mis-tapping. Two more issues cause silent no-ops or ambiguous data (event tags) that erode trust in the tool during actual use. None of this is visible in a code review that only checks types/lint — it only shows up by driving the UI.

## Current state

**1. Two ways to end a match, zero confirmation.**

`src/components/timer/match-controls.tsx:120-132` — the skip/next button doubles as "end match" on the last period, no confirm:

```tsx
<motion.button
  type="button"
  whileTap={{ scale: 0.94 }}
  disabled={ended}
  aria-label={isLastPeriod ? "Terminar jogo" : "Próxima parte"}
  onClick={() => {
    cueTap();
    onNext();
  }}
  className="grid h-14 w-14 place-items-center rounded-[14px] border border-arena-border bg-arena-surface text-arena-text-sec disabled:opacity-40"
>
  {isLastPeriod ? <Square size={18} /> : <SkipForward size={20} />}
</motion.button>
```

`match-controls.tsx:162-170` — the secondary "Terminar jogo agora" text link, also unconfirmed:

```tsx
{!ended && status !== "idle" && (
  <button type="button" onClick={onEnd} className="self-center text-xs font-semibold text-arena-text-muted underline-offset-2 hover:text-arena-text-sec hover:underline">
    Terminar jogo agora
  </button>
)}
```

Compare with the restart button one block above (`match-controls.tsx:134-159`), which already has the confirm-arm pattern this plan reuses:

```tsx
const [confirmRestart, setConfirmRestart] = useState(false);
...
{!confirmRestart ? (
  <motion.button onClick={() => setConfirmRestart(true)}>...</motion.button>
) : (
  <motion.button onClick={() => { setConfirmRestart(false); onRestart(); }} onBlur={() => setConfirmRestart(false)}>
    Sim?
  </motion.button>
)}
```

**2. "Registar golo"/"Registar cartão" is a dead click the first time, when a team has exactly one player.**

`src/components/timer/log-goal-sheet.tsx:57-125` auto-highlights the sole player's `PlayerPill` visually (its `active` styling is purely derived from `scorer === p.id`, which starts `null`), but the confirm button is gated on real state:

```tsx
const [scorer, setScorer] = useState<string | null>(null);
...
<Cta fullWidth disabled={hasPlayers && !scorer} onClick={...}>
  Registar golo
</Cta>
```

Nothing pre-selects `scorer` when there is exactly one player, so the button renders in its enabled color (visually indistinguishable from truly-enabled — no `disabled` styling difference was observed in manual QA) but the click handler no-ops because `disabled` is `true`. `src/components/timer/log-card-sheet.tsx` was not opened in this pass but should be checked for the same pattern (see Step 3).

**3. Event-log team tags are ambiguous with default team names.**

`src/components/timer/event-timeline.tsx:95-100`:

```tsx
<span className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase" style={{ background: `${team.color}22`, color: team.color }}>
  {team.name.slice(0, 3)}
</span>
```

Default teams are named "Equipa A" / "Equipa B" (`setup-drawer.tsx:30-36`, `blankTeam()`), both of which `.slice(0, 3)` to `"EQU"`. Every event in the timeline shows the identical tag regardless of team; the only differentiator is `team.color`, which is a ~14px swatch a coach has to compare pixel-by-pixel mid-match. Team names with accents also truncate awkwardly (observed: "Leões FC" → "LEÕ").

**4. Post-"end match" screen is confusing.**

`use-match-store.ts:269-284` (`endMatch`) correctly freezes `state.status = "ended"` and stops the clock — this part is solid, verified by waiting on the frozen screen and confirming the ring value did not change. The problem is purely presentational: after dismissing the `SummaryModal` (X button), the user lands back on `MatchView` with every control `disabled` (`match-controls.tsx` gates `disabled={ended}`/`disabled={logDisabled}` throughout) but styled identically to a live, paused match — same layout, same dimmed-not-hidden buttons. There's no distinct "this match is over" state on that screen; the only way to see it clearly is to reopen `SummaryModal` from the hub list.

**5. `EventTimeline`'s delete affordance is invisible on touch.**

`event-timeline.tsx:101-108`:

```tsx
<button type="button" aria-label="Remover lance" onClick={() => onRemove(ev.id)}
  className="shrink-0 rounded-md p-1.5 text-arena-text-muted opacity-0 transition hover:text-arena-danger group-hover:opacity-100">
  <Trash2 size={14} />
</button>
```

`opacity-0` + `group-hover:opacity-100` means the delete control is invisible until the parent row is hovered — there is no `:active`/touch equivalent. On the phone this tool is designed for, a coach who logs a goal against the wrong team has no visible way to undo it; the button is present (screen-reader/`aria-label` accessible) but not discoverable visually.

**6. `Treino` (training) is functionally a relabeled `Jogo` (match) — product decision, not a straight bug fix.**

Confirmed by grep: `match.type` (`"jogo" | "treino"`) is read in exactly one place outside the setup wizard — `hub-view.tsx:60`, to pick a 🏆 vs 🎯 emoji in the list. `setup-drawer.tsx` step 1 (`src/components/timer/setup-drawer.tsx:293-304`) always renders two `TeamEditor`s regardless of `type`; step 2 always renders `Regressivo/Cronológico` + `Duração da parte`/`Número de partes`; `MatchControls` always renders per-team "Golo"/"Cartão". A training session is therefore always modeled as "Team A vs Team B" scoring goals and cards — there is no drill/attendance/single-roster path. This is flagged, not fixed, in this plan (Step 6) because it's a product-model decision (does Treino get its own data shape, or is a differently-labeled Jogo actually fine for this tool's scope?), not something to silently rewrite.

## Corrections to the prior manual QA pass

Two items from the initial QA writeup do not hold up under source review and are **not** included as fixes below:

- **"Floating avatar overlaps 'Registar golo' on mobile."** The overlapping bottom-left circular "N" badge in the screenshots is the Next.js development-mode indicator, not app UI (no `fixed`/`bottom-left` element in `src/components/arena` or `src/app/(public)/timer` matches it — see grep in this plan's research). It will not render in a production build. If you want certainty, verify visually with `pnpm build && pnpm start` at 390px width before treating this as closed.
- **"Wizard step 2 ('Equipas') sometimes renders step-1 content instead of the team editors."** `setup-drawer.tsx:214-234` shows plain `useState` step-driven rendering with no conditional bug — `step === 1` unconditionally renders both `TeamEditor`s. The observed flicker is most likely `AnimatePresence mode="wait"` (`setup-drawer.tsx:256`) exit/enter animation overlap under slow rendering, not a data-loss bug. Downgraded to a P2 verification task — see Step 7.

## Commands you will need

| Purpose   | Command         | Expected on success |
|-----------|-----------------|----------------------|
| Typecheck | `pnpm ts-check` | exit 0 |
| Lint      | `pnpm lint`     | exit 0 |
| Dev server (manual QA) | `pnpm dev` then open `/timer` | — |
| Production check (Step 7 correction re-verify) | `pnpm build && pnpm start` | no dev "N" badge at 390px width |

No test harness currently covers `src/components/timer` (confirmed absent from [001-verification-baseline.md](001-verification-baseline.md), whose scope explicitly lists "the timer module internals" as not audited). This plan does not add one — see Maintenance notes.

## Scope

**In scope**:
- `src/components/timer/match-controls.tsx`
- `src/components/timer/log-goal-sheet.tsx`
- `src/components/timer/log-card-sheet.tsx`
- `src/components/timer/event-timeline.tsx`
- `src/components/timer/match-view.tsx` (only if Step 4's "ended" state needs a wrapper-level change — check before editing)
- `src/components/timer/summary-modal.tsx` (read-only, to confirm Step 4's target behavior)
- `plans/README.md` (status row)

**Out of scope** (do NOT touch):
- `src/components/timer/setup-drawer.tsx` beyond Step 7's verification (no code change planned there — see that step)
- Any change to `use-match-store.ts` persistence/derivation logic — it is correct as-is (verified: reload survives, background-tab timer stays accurate via timestamp math, stoppage time counts up correctly past the period target)
- Building a distinct Treino data model/flow (Step 6 is a flagged decision, not an implementation)
- Wiring `/timer` into `matchSessions`/team stats — explicitly out of scope per `plans/README.md`'s "Timer → team ecosystem bridge" note

## Git workflow

- Branch: `advisor/006-timer-cronometro-ux-fixes`
- Conventional commits, e.g. `fix(timer): require confirmation before ending a match`
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1 (P0): Confirm before ending a match, from both entry points

Add one `confirmEnd` state in `MatchControls`, reusing the exact pattern already proven for `confirmRestart`:

1. When `isLastPeriod` is true, the skip/next button (`match-controls.tsx:120-132`) must arm on first tap (swap `Square` icon for the same red "Sim?" chip style used by restart) and only call `onNext()` on the second tap. When `isLastPeriod` is false, behavior is unchanged (`SkipForward`, immediate `onNext()` — this transitions periods, it doesn't end anything).
2. The "Terminar jogo agora" link (`match-controls.tsx:162-170`) must arm the same `confirmEnd` state on first tap, swap its label to something explicit ("Confirmas? Terminar" or similar, PT-PT, red/danger text), and only call `onEnd()` on the second tap within the same interaction. Add `onBlur`-based auto-revert like the restart button does, so an armed-but-abandoned confirm doesn't linger.
3. Keep both entry points wired to the same `confirmEnd` boolean so arming one doesn't leave the other silently armed too.

**Verify**: manually — start a match, tap "Terminar jogo agora" once (state stays live, label changes), tap elsewhere (reverts), tap "Terminar jogo agora" twice in a row (match ends). Repeat for the last-period skip button. `pnpm ts-check` → exit 0.

### Step 2 (P1): Fix the dead-click on single-player goal/card confirm

In `log-goal-sheet.tsx`, when `team.players.length === 1`, initialize `scorer` to that player's id instead of `null`:

```tsx
const [scorer, setScorer] = useState<string | null>(
  team.players.length === 1 ? team.players[0].id : null,
);
```

Open `log-card-sheet.tsx` (not read in this QA pass) and apply the equivalent fix if it has the same `useState(null)` + `disabled={hasPlayers && !selected}` pattern.

**Verify**: create a match with a team that has exactly one player, log a goal, confirm "Registar golo" works on the first tap without needing to re-tap the player pill. Same for a card.

### Step 3 (P1): Disambiguate event-timeline team tags

Replace the 3-letter name slice in `event-timeline.tsx:95-100` with something that can't collide between default-named teams. Two options, pick one:

- **(a) Minimal**: prefix with team side or add the team's color swatch as a small dot next to the tag text, so "EQU" + green dot vs "EQU" + blue dot are visually distinguishable at a glance, not just by background tint.
- **(b) Better**: use `team.name.slice(0,1).toUpperCase()` (matches the avatar-letter convention already used in `setup-drawer.tsx:64` and `log-goal-sheet.tsx:50`) instead of a 3-letter slice — single-letter badges don't visually claim to be a real abbreviation and are consistent with the rest of the app's team-initial convention.

Recommend (b) for consistency with existing patterns elsewhere in this file tree.

**Verify**: create a match with default "Equipa A"/"Equipa B" names, log one goal for each team, confirm the timeline entries are visually distinguishable without needing to compare colors.

### Step 4 (P2): Give the "ended" match screen its own visual state

In `match-view.tsx` (read before editing to confirm current structure), when `match.state.status === "ended"`, either:
- auto-open `SummaryModal` on mount instead of requiring the user to have it open already, or
- render a distinct "Jogo terminado" banner/empty-state above the disabled controls instead of leaving them visually identical to a live paused match.

Either is acceptable; pick whichever fits the existing component structure with the smaller diff.

**Verify**: end a match, dismiss the summary modal (X), confirm the resulting screen clearly communicates "this match is over" rather than looking like a paused live match.

### Step 5 (P2): Make the "remove lance" control usable on touch

In `event-timeline.tsx:101-108`, remove the `opacity-0`/`group-hover:opacity-100` hide-until-hover pattern. Options:
- Always show the `Trash2` button at reduced opacity (e.g. `opacity-40`) and full opacity on `:active`/focus, so it's discoverable without hover.
- Or move delete behind a swipe/long-press gesture if the design system has a precedent for it elsewhere — check `DESIGN.md` first per this repo's `CLAUDE.md` convention before introducing a new interaction pattern.

**Verify**: on a touch-width viewport (390px), confirm the delete control for a logged lance is visible without needing a hover state.

### Step 6 (flag only, no implementation): Treino vs Jogo data model

Do not implement in this plan. Bring to the maintainer as an explicit either/or:

- **(a)** Keep Treino as a relabeled Jogo (current behavior) and just adjust copy so it doesn't say "Golo"/"Cartão"/"Equipa A vs Equipa B" for a training context — cheapest, still a same-shape `Match`.
- **(b)** Give Treino a real distinct flow (single roster, drill/segment tracking instead of two-team scoring) — bigger scope, likely its own plan.

Note in `plans/README.md` under "Direction options" if the maintainer wants this tracked there.

### Step 7 (P2, verification only): Confirm the wizard-flicker correction

Manually drive the setup wizard 5–10 times (select "Jogo", advance to step 2, advance to step 3, "Voltar" back to step 2) on a throttled CPU (Chrome DevTools 6x slowdown) to try to reproduce the step-1-content-under-step-2-title flash from the original QA pass. If reproducible, it's a `framer-motion` `AnimatePresence` timing issue in `setup-drawer.tsx:256` (`mode="wait"`) — consider `mode="popLayout"` or an explicit `onExitComplete` guard. If not reproducible after this many attempts, close it as a one-off render glitch and note that in the status row.

## Test plan

No automated coverage exists for `src/components/timer` (see Commands section). This plan relies on the manual verification steps listed under each Step. If a follow-up plan later adds component tests to this module (flag for `plans/001`-style test infra, not in scope here), Steps 1–3 are the highest-value candidates: confirm-before-end state machine, single-player auto-select, and tag rendering are all pure-enough logic to unit test without a DOM.

## Done criteria

- [ ] `pnpm ts-check`, `pnpm lint` exit 0
- [ ] Both end-match entry points require a second confirming tap (Step 1)
- [ ] Single-player goal/card confirm works on first tap (Step 2)
- [ ] Timeline tags are visually distinguishable for two default-named teams (Step 3)
- [ ] Post-end screen is visually distinct from a live paused match (Step 4)
- [ ] Delete-lance control is visible without hover at 390px width (Step 5)
- [ ] Step 6 decision brought to maintainer and logged in `plans/README.md`, not silently implemented
- [ ] Step 7 either reproduces and gets a real fix, or is explicitly closed with a note
- [ ] No files outside scope modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `log-card-sheet.tsx` does not follow the same `useState(null)` + `disabled` pattern as `log-goal-sheet.tsx` — Step 2's fix needs to be re-derived for whatever pattern it actually uses.
- `match-view.tsx`'s structure doesn't allow either of Step 4's two options without a materially larger change than the rest of this plan — stop and propose a third option rather than forcing a bad fit.
- Step 7 reproduces consistently and looks like more than an animation-timing issue (e.g. `type` state genuinely resets or step content genuinely doesn't match `step`) — that would resurrect the original P0 classification and should be re-scoped, not patched inline.

## Maintenance notes

- `src/components/timer` has zero test coverage; this plan intentionally does not add a harness (out of scope, would balloon Effort past M) but Steps 1–3 are flagged above as the best first candidates if/when someone picks that up.
- The "ended" match's frozen state (`use-match-store.ts:269-284`) was verified correct in this QA pass — do not re-litigate that logic while working this plan, only the screen that renders it (Step 4).
- Reviewer focus: Step 1 is the one item in this plan with real user-harm potential (irreversible data loss on a single mis-tap); review it more carefully than the rest.
