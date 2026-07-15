# Timer UX Sweep Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix seven audited defects and usability gaps in the `/timer` + `/timer/tournament` modules: tournament matches leaking into the timer hub, touch-invisible/unconfirmed deletes, missing cross-navigation, screen sleeping mid-match, undated hub cards, and a dead-end "Novo jogo" button.

**Architecture:** All changes are local to `src/components/timer/`, `src/components/tournament/`, and the 4 locale files. Pure logic (match filtering, date formatting) is extracted into testable functions with TDD; UI changes are verified in the browser. No schema, route, or dependency changes.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript · vitest (node env) · framer-motion · lucide-react · next-intl (tournament module only — timer module stays hardcoded PT by convention until the dedicated i18n plan)

## Global Constraints

- Timer module (`src/components/timer/`) copy: hardcoded PT-PT (existing convention; module-wide i18n is a separate deferred plan). Tournament module (`src/components/tournament/`) copy: next-intl keys in **all** of `pt.json`, `en.json`, `es.json`, `fr.json`.
- Tailwind Arena tokens only; no hardcoded hex in JSX except runtime values (team colors).
- Destructive actions use the module's existing two-tap "Sim?" confirm pattern (see `match-controls.tsx` restart button).
- Conventional commits, one per task.
- Verification per task: `pnpm test && pnpm ts-check && pnpm lint` — all exit 0 (lint has 5 pre-existing errors in untouched files: `log-card-sheet`, `log-goal-sheet`, `player-picker`, `use-match-store` format — do not fix, do not add new ones; scope biome checks to touched files: `npx biome check <files>`).
- Final task also runs `pnpm build` and the full browser flow.

## Audited findings this plan fixes

| # | Finding | Severity |
|---|---|---|
| 1 | `HubView` lists ALL matches via `loadMatches()` — tournament matches appear in the `/timer` hub; opening one without `?tournament=` breaks the tournament flow (standalone summary instead of decision/continue) | bug |
| 2 | Hub delete button is `opacity-0 group-hover:opacity-100` — invisible on touch devices (mobile-first product), and deletes with a single tap, no confirmation | bug |
| 3 | Tournament hub has no delete at all — tournaments accumulate forever | gap |
| 4 | Zero cross-navigation between `/timer` and `/timer/tournament` — tournament hub reachable only by URL | usability |
| 5 | No wake lock — screen sleeps mid-match at the field (clock survives via timestamps, but the screen going dark during a running match is the top field-usability gap) | usability |
| 6 | Hub match cards show no creation date — repeated fixtures are indistinguishable | UI |
| 7 | Summary modal "Novo jogo" navigates to the hub without opening the setup drawer — dead-end label | UX |

---

## File Structure

**Modify:**
- `src/components/timer/use-match-store.ts` — add `standaloneOnly` + `loadStandaloneMatches`.
- `src/components/timer/hub-view.tsx` — standalone filter, delete confirm, tournament link, card dates, `?novo=1` setup opening.
- `src/components/timer/format.ts` — add `formatMatchDate`.
- `src/components/timer/match-view.tsx` — wake lock, "Novo jogo" query param.
- `src/components/tournament/tournament-hub-view.tsx` — delete with confirm, timer link.
- `src/locales/{pt,en,es,fr}.json` — tournament hub keys.

**Create:**
- `src/components/timer/use-wake-lock.ts` — reusable screen wake-lock hook.
- Test: `src/components/timer/use-match-store.test.ts`, `src/components/timer/format.test.ts`.

---

### Task 1: Keep tournament matches out of the timer hub

**Files:**
- Modify: `src/components/timer/use-match-store.ts` (after `loadMatches`, line ~44)
- Modify: `src/components/timer/hub-view.tsx` (import at line ~11-18; `loadMatches()` calls at lines ~98 and ~126)
- Test (create): `src/components/timer/use-match-store.test.ts`

**Interfaces:**
- Consumes: `Match` from `./types`, existing `loadMatches()` (returns all matches sorted by `createdAt` desc), `Match.tournamentContext?` (present only on tournament-created matches).
- Produces: `standaloneOnly(matches: Match[]): Match[]` and `loadStandaloneMatches(): Match[]` — the hub consumes the latter; no other consumers.

- [ ] **Step 1: Write the failing test**

Create `src/components/timer/use-match-store.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Match } from "./types";
import { createMatch, standaloneOnly } from "./use-match-store";

function base(): Match {
  return createMatch(
    "jogo",
    { name: "A", color: "#7CFF4F", players: [] },
    { name: "B", color: "#38BDF8", players: [] },
    { mode: "down", periodLenSec: 600, periods: 1, sound: false },
  );
}

describe("standaloneOnly", () => {
  it("filters out tournament-context matches", () => {
    const standalone = base();
    const tournamentMatch: Match = {
      ...base(),
      tournamentContext: {
        tournamentId: "t1",
        teamAId: "a",
        teamBId: "b",
        queue: [],
      },
    };
    expect(standaloneOnly([standalone, tournamentMatch])).toEqual([standalone]);
  });

  it("returns empty for empty input", () => {
    expect(standaloneOnly([])).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- use-match-store`
Expected: FAIL — `standaloneOnly` is not exported.

- [ ] **Step 3: Implement in `use-match-store.ts`**

Insert directly after the existing `loadMatches` function:

```ts
/** Matches created outside any tournament — the timer hub lists only these. */
export function standaloneOnly(matches: Match[]): Match[] {
  return matches.filter(m => !m.tournamentContext);
}

export function loadStandaloneMatches(): Match[] {
  return standaloneOnly(loadMatches());
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- use-match-store`
Expected: PASS (2 tests).

- [ ] **Step 5: Switch the hub to the filtered loader**

In `src/components/timer/hub-view.tsx`, change the import block entry from `loadMatches` to `loadStandaloneMatches`:

```ts
import {
  createMatch,
  deleteMatch,
  loadStandaloneMatches,
  saveTeam,
  score,
  upsertMatch,
} from "./use-match-store";
```

And replace both call sites:

```ts
  useEffect(() => {
    setMatches(loadStandaloneMatches());
  }, []);
```

```ts
  function remove(id: string) {
    deleteMatch(id);
    setMatches(loadStandaloneMatches());
  }
```

- [ ] **Step 6: Verify and commit**

Run: `pnpm test && pnpm ts-check` — exit 0. `npx biome check src/components/timer/use-match-store.test.ts src/components/timer/hub-view.tsx` — no new errors (note: `use-match-store.ts` itself has a pre-existing format error; leave it).

Browser (dev server on `localhost:3000`): with a tournament in progress (create one at `/timer/tournament` and start a match), open `/timer` — the tournament's match must NOT appear under "Recentes"; standalone matches still do.

```bash
git add src/components/timer/use-match-store.ts src/components/timer/use-match-store.test.ts src/components/timer/hub-view.tsx
git commit -m "fix(timer): keep tournament matches out of the standalone hub"
```

---

### Task 2: Touch-visible, confirmed delete on timer hub cards

**Files:**
- Modify: `src/components/timer/hub-view.tsx` (`MatchCard`, delete button block at lines ~79-86; `useState` already imported)

**Interfaces:**
- Consumes: existing `MatchCard` props (`match`, `onOpen`, `onDelete`).
- Produces: nothing new — internal state only.

- [ ] **Step 1: Add confirm state to `MatchCard`**

Inside `MatchCard`, first line of the body (before `const s = score(match);`):

```tsx
  const [confirmDelete, setConfirmDelete] = useState(false);
```

- [ ] **Step 2: Replace the delete button block**

Replace:

```tsx
      <button
        type="button"
        aria-label="Eliminar"
        onClick={onDelete}
        className="shrink-0 rounded-lg p-2 text-arena-text-muted opacity-0 transition hover:text-arena-danger group-hover:opacity-100"
      >
        <Trash2 size={16} />
      </button>
```

with:

```tsx
      <button
        type="button"
        aria-label={
          confirmDelete ? "Confirmar eliminação do jogo" : "Eliminar jogo"
        }
        onClick={() => {
          if (confirmDelete) onDelete();
          else setConfirmDelete(true);
        }}
        onBlur={() => setConfirmDelete(false)}
        className={
          confirmDelete
            ? "shrink-0 rounded-lg bg-arena-danger px-2.5 py-2 text-[10px] font-bold text-white"
            : "shrink-0 rounded-lg p-2 text-arena-text-muted opacity-60 transition hover:text-arena-danger hover:opacity-100"
        }
      >
        {confirmDelete ? "Sim?" : <Trash2 size={16} />}
      </button>
```

- [ ] **Step 3: Verify and commit**

Run: `pnpm ts-check` — exit 0. `npx biome check src/components/timer/hub-view.tsx` — clean.

Browser at `/timer` with at least one standalone match: trash icon is visible without hover (dimmed); first tap turns it into a red "Sim?"; second tap deletes; tapping elsewhere (blur) reverts to the icon.

```bash
git add src/components/timer/hub-view.tsx
git commit -m "fix(timer): make hub delete touch-visible and two-tap confirmed"
```

---

### Task 3: Delete tournaments from the tournament hub

**Files:**
- Modify: `src/components/tournament/tournament-hub-view.tsx` (`TournamentCard` component, lines ~23-79; `TournamentHubView` list rendering, lines ~168-177)
- Modify: `src/locales/pt.json`, `src/locales/en.json`, `src/locales/es.json`, `src/locales/fr.json` (namespace `Tournament.hub`)

**Interfaces:**
- Consumes: `tournamentRepository.remove(id: string): Promise<void>` (exists in `tournament-store.ts`). Locale anchor: each locale has exactly one `"emptyCta"` key inside `Tournament.hub`.
- Produces: `TournamentCard` gains an `onDelete: () => void` prop.

- [ ] **Step 1: Add locale keys**

In each locale, inside `Tournament.hub`, right after the `"emptyCta"` line, add (values per language):

`pt.json`:
```json
        "deleteTournament": "Eliminar {name}",
        "deleteConfirm": "Sim?"
```
`en.json`:
```json
        "deleteTournament": "Delete {name}",
        "deleteConfirm": "Sure?"
```
`es.json`:
```json
        "deleteTournament": "Eliminar {name}",
        "deleteConfirm": "¿Sí?"
```
`fr.json`:
```json
        "deleteTournament": "Supprimer {name}",
        "deleteConfirm": "Sûr ?"
```

(Remember the comma on the previous `"emptyCta"` line.) Validate: `for f in src/locales/*.json; do python3 -m json.tool "$f" > /dev/null && echo OK; done` → 4× OK.

- [ ] **Step 2: Restructure `TournamentCard` — outer button becomes a div with two buttons**

Replace the whole `TournamentCard` function with:

```tsx
interface TournamentCardProps {
  tournament: Tournament;
  index: number;
  onOpen: () => void;
  onDelete: () => void;
}

function TournamentCard({
  tournament,
  index,
  onOpen,
  onDelete,
}: TournamentCardProps) {
  const t = useTranslations("Tournament");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const currentTeams = tournament.currentPair
    ?.map(teamId => tournament.teams.find(team => team.id === teamId)?.name)
    .filter((name): name is string => Boolean(name));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ delay: index * 0.03 }}
      className="press group flex min-h-20 w-full items-center gap-3 rounded-[16px] border border-arena-border bg-arena-surface p-3 transition-colors hover:border-arena-primary/40 hover:bg-arena-surface-el"
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-arena-highlight/15 text-arena-highlight">
          <Trophy size={21} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-bold text-arena-text">
            {tournament.name || t("fallbackName")}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                STATUS_STYLES[tournament.status],
              )}
            >
              {t(`status.${tournament.status}`)}
            </span>
            <span className="text-xs text-arena-text-muted">
              {t("hub.teamCount", { count: tournament.teams.length })}
            </span>
          </span>
          {currentTeams?.length === 2 ? (
            <span className="mt-1 truncate text-xs text-arena-text-sec">
              {t("hub.currentPair", {
                teamA: currentTeams[0],
                teamB: currentTeams[1],
              })}
            </span>
          ) : null}
        </span>
        <ChevronRight
          size={18}
          className="shrink-0 text-arena-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-arena-primary"
        />
      </button>
      <button
        type="button"
        aria-label={t("hub.deleteTournament", {
          name: tournament.name || t("fallbackName"),
        })}
        onClick={() => {
          if (confirmDelete) onDelete();
          else setConfirmDelete(true);
        }}
        onBlur={() => setConfirmDelete(false)}
        className={
          confirmDelete
            ? "shrink-0 rounded-lg bg-arena-danger px-2.5 py-2 text-[10px] font-bold text-white"
            : "shrink-0 rounded-lg p-2 text-arena-text-muted opacity-60 transition hover:text-arena-danger hover:opacity-100"
        }
      >
        {confirmDelete ? t("hub.deleteConfirm") : <Trash2 size={16} />}
      </button>
    </motion.div>
  );
}
```

Add `Trash2` to the lucide import:

```ts
import { ChevronRight, Plus, Trash2, Trophy } from "lucide-react";
```

- [ ] **Step 3: Wire deletion in `TournamentHubView`**

Add the handler inside `TournamentHubView` (after the `useEffect`):

```tsx
  async function removeTournament(id: string) {
    await tournamentRepository.remove(id);
    setTournaments(current => current.filter(item => item.id !== id));
  }
```

And pass it in the list rendering:

```tsx
            {tournaments.map((tournament, index) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                index={index}
                onOpen={() => router.push(`/timer/tournament/${tournament.id}`)}
                onDelete={() => void removeTournament(tournament.id)}
              />
            ))}
```

- [ ] **Step 4: Verify and commit**

Run: `pnpm test && pnpm ts-check` — exit 0. `npx biome check src/components/tournament/tournament-hub-view.tsx src/locales` — clean.

Browser at `/timer/tournament` with ≥1 tournament: card still opens on tap; trash → "Sim?" → second tap removes the card and it stays gone after refresh (repository persisted).

```bash
git add src/components/tournament/tournament-hub-view.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "feat(tournament): delete tournaments from the hub with two-tap confirm"
```

---

### Task 4: Cross-navigation between the two hubs

**Files:**
- Modify: `src/components/timer/hub-view.tsx` (header block, lines ~131-143; lucide import line ~5)
- Modify: `src/components/tournament/tournament-hub-view.tsx` (header block, lines ~104-117; lucide import)
- Modify: `src/locales/{pt,en,es,fr}.json` (`Tournament.hub` — one key)

**Interfaces:**
- Consumes: `router` already present in both components.
- Produces: nothing consumed downstream.

- [ ] **Step 1: Timer hub → tournaments link**

In `src/components/timer/hub-view.tsx`, add `Trophy` to the lucide import:

```ts
import { Plus, Timer, Trash2, Trophy } from "lucide-react";
```

Replace the header block:

```tsx
      <header className="flex items-center gap-2.5 pt-6 pb-5">
        <span className="grid size-10 place-items-center rounded-xl bg-arena-primary/15 ring-1 ring-arena-primary/40">
          <Timer size={20} className="text-arena-primary" />
        </span>
        <div className="flex flex-col">
          <h1 className="font-sora text-lg font-extrabold leading-none text-arena-text">
            Cronómetro
          </h1>
          <span className="text-xs text-arena-text-sec">
            Gestor de jogos &amp; treinos
          </span>
        </div>
      </header>
```

with:

```tsx
      <header className="flex items-center justify-between gap-3 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-arena-primary/15 ring-1 ring-arena-primary/40">
            <Timer size={20} className="text-arena-primary" />
          </span>
          <div className="flex flex-col">
            <h1 className="font-sora text-lg font-extrabold leading-none text-arena-text">
              Cronómetro
            </h1>
            <span className="text-xs text-arena-text-sec">
              Gestor de jogos &amp; treinos
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => router.push("/timer/tournament")}
          className="press flex shrink-0 items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface px-3 py-2 text-xs font-bold text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-primary"
        >
          <Trophy size={14} /> Torneios
        </button>
      </header>
```

- [ ] **Step 2: Tournament hub → timer link**

Add locale key inside `Tournament.hub` (after `"deleteConfirm"` from Task 3):

pt: `"openTimer": "Cronómetro"` · en: `"openTimer": "Timer"` · es: `"openTimer": "Cronómetro"` · fr: `"openTimer": "Chronomètre"`

In `src/components/tournament/tournament-hub-view.tsx`, add `Timer` to the lucide import:

```ts
import { ChevronRight, Plus, Timer, Trash2, Trophy } from "lucide-react";
```

The header is already `justify-between`; add the button as the header's last child, after the closing `</div>` of the left block (before `</header>`):

```tsx
        <button
          type="button"
          onClick={() => router.push("/timer")}
          className="press flex shrink-0 items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface px-3 py-2 text-xs font-bold text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-primary"
        >
          <Timer size={14} /> {t("hub.openTimer")}
        </button>
```

- [ ] **Step 3: Verify and commit**

Run: `pnpm ts-check` — exit 0. JSON check on the 4 locales — OK. `npx biome check` on both touched components — clean.

Browser: `/timer` header shows "Torneios" button → navigates to `/timer/tournament`; that hub's header shows "Cronómetro" → navigates back.

```bash
git add src/components/timer/hub-view.tsx src/components/tournament/tournament-hub-view.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "feat(timer): cross-navigation between timer and tournament hubs"
```

---

### Task 5: Screen wake lock while a match runs

**Files:**
- Create: `src/components/timer/use-wake-lock.ts`
- Modify: `src/components/timer/match-view.tsx` (import block; one hook call after `useLiveMatch`)

**Interfaces:**
- Consumes: browser `navigator.wakeLock` (typed in lib.dom; feature-detected — no-op on unsupported browsers).
- Produces: `useWakeLock(active: boolean): void` — consumed only by `MatchView`.

- [ ] **Step 1: Write the hook**

Create `src/components/timer/use-wake-lock.ts`:

```ts
"use client";

import { useEffect } from "react";

/**
 * Keeps the screen awake while `active` — the phone must not sleep mid-match
 * at the field. Re-acquires on tab re-focus (the OS releases wake locks when
 * the page is hidden). No-op where the Wake Lock API is unsupported.
 */
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (
      !active ||
      typeof navigator === "undefined" ||
      !("wakeLock" in navigator)
    ) {
      return;
    }

    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire() {
      try {
        lock = await navigator.wakeLock.request("screen");
      } catch {
        /* low battery or platform refusal — degrade silently */
      }
    }

    function onVisibilityChange() {
      if (!cancelled && document.visibilityState === "visible") {
        void acquire();
      }
    }

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      void lock?.release().catch(() => {});
    };
  }, [active]);
}
```

- [ ] **Step 2: Use it in `MatchView`**

Add the import (alphabetical position among relative imports):

```ts
import { useWakeLock } from "./use-wake-lock";
```

Add the call directly after the `useLiveMatch` line inside `MatchView`:

```ts
  const { match, now, actions } = useLiveMatch(id);
  useWakeLock(match?.state.status === "running");
```

- [ ] **Step 3: Verify and commit**

Run: `pnpm test && pnpm ts-check` — exit 0. `npx biome check src/components/timer/use-wake-lock.ts src/components/timer/match-view.tsx` — clean.

Browser: start a match and run it; console shows no errors. In Chrome, evaluate `"wakeLock" in navigator` → `true`, and no unhandled rejection appears while toggling play/pause. (Full sleep-prevention behavior needs a physical device — note it in the final report.)

```bash
git add src/components/timer/use-wake-lock.ts src/components/timer/match-view.tsx
git commit -m "feat(timer): keep screen awake while a match is running"
```

---

### Task 6: Creation date on hub match cards

**Files:**
- Modify: `src/components/timer/format.ts` (append function)
- Modify: `src/components/timer/hub-view.tsx` (`MatchCard` status badge block, lines ~69-74; import from `./format`)
- Test (create): `src/components/timer/format.test.ts`

**Interfaces:**
- Consumes: `Match.createdAt: number` (epoch ms).
- Produces: `formatMatchDate(createdAt: number, now?: number): string` — "hoje · 15:30", "ontem · 09:05", or "30 jun".

- [ ] **Step 1: Write the failing test**

Create `src/components/timer/format.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatClock, formatMatchDate, formatMinute } from "./format";

describe("formatMatchDate", () => {
  const now = new Date(2026, 6, 15, 18, 0).getTime(); // 15 jul 2026, 18:00 local

  it("labels same-day matches with time", () => {
    const at = new Date(2026, 6, 15, 15, 30).getTime();
    expect(formatMatchDate(at, now)).toBe("hoje · 15:30");
  });

  it("labels yesterday with time", () => {
    const at = new Date(2026, 6, 14, 9, 5).getTime();
    expect(formatMatchDate(at, now)).toBe("ontem · 09:05");
  });

  it("labels older dates with day and short month", () => {
    const at = new Date(2026, 5, 30, 10, 0).getTime();
    expect(formatMatchDate(at, now)).toBe("30 jun");
  });
});

describe("formatClock", () => {
  it("formats mm:ss and h:mm:ss", () => {
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(3665)).toBe("1:01:05");
  });
});

describe("formatMinute", () => {
  it("floors seconds to the match minute", () => {
    expect(formatMinute(119)).toBe("1'");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test -- format`
Expected: FAIL — `formatMatchDate` is not exported. (`formatClock`/`formatMinute` assertions will pass once the module loads.)

- [ ] **Step 3: Implement in `format.ts`**

Append:

```ts
const PT_MONTHS = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

/** Compact PT-PT creation label: "hoje · 15:30", "ontem · 09:05", "30 jun". */
export function formatMatchDate(
  createdAt: number,
  now: number = Date.now(),
): string {
  const d = new Date(createdAt);
  const n = new Date(now);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
  if (d.toDateString() === n.toDateString()) return `hoje · ${time}`;
  const yesterday = new Date(n);
  yesterday.setDate(n.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `ontem · ${time}`;
  return `${d.getDate()} ${PT_MONTHS[d.getMonth()]}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test -- format`
Expected: PASS (5 tests).

- [ ] **Step 5: Show it on the card**

In `src/components/timer/hub-view.tsx`, extend the `./format` import:

```ts
import { formatMatchDate, uid } from "./format";
```

Replace the status badge block inside `MatchCard`:

```tsx
          <span
            className={`mt-1 w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}
          >
            {st.label}
          </span>
```

with:

```tsx
          <span className="mt-1 flex items-center gap-2">
            <span
              className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-bold ${st.cls}`}
            >
              {st.label}
            </span>
            <span className="text-[10px] text-arena-text-muted">
              {formatMatchDate(match.createdAt)}
            </span>
          </span>
```

- [ ] **Step 6: Verify and commit**

Run: `pnpm test && pnpm ts-check` — exit 0. `npx biome check src/components/timer/format.ts src/components/timer/format.test.ts src/components/timer/hub-view.tsx` — clean.

Browser at `/timer`: each card shows the status badge plus "hoje · HH:MM" for today's matches.

```bash
git add src/components/timer/format.ts src/components/timer/format.test.ts src/components/timer/hub-view.tsx
git commit -m "feat(timer): show creation date on hub match cards"
```

---

### Task 7: "Novo jogo" opens the setup drawer directly

**Files:**
- Modify: `src/components/timer/match-view.tsx` (the `SummaryModal` `onNewGame` prop, line ~232)
- Modify: `src/components/timer/hub-view.tsx` (`HubView` — `useSearchParams` initializer + close handler)

**Interfaces:**
- Consumes: `useSearchParams` from `next/navigation` (already used by `match-view.tsx`; `/timer` renders dynamically — build lists it as `ƒ`, so no Suspense wrapper is needed, same as the match route).
- Produces: URL contract `/timer?novo=1` → hub mounts with the setup drawer open.

- [ ] **Step 1: Point "Novo jogo" at the setup**

In `src/components/timer/match-view.tsx`, change the `SummaryModal` usage:

```tsx
        <SummaryModal
          match={match}
          onClose={() => setSummaryOpen(false)}
          onHome={() => router.push("/timer")}
          onNewGame={() => router.push("/timer?novo=1")}
        />
```

- [ ] **Step 2: Honor the param in the hub**

In `src/components/timer/hub-view.tsx`, change the navigation import:

```ts
import { useRouter, useSearchParams } from "next/navigation";
```

Inside `HubView`, replace:

```tsx
  const [setupOpen, setSetupOpen] = useState(false);
```

with:

```tsx
  const openSetupFromUrl = useSearchParams().get("novo") === "1";
  const [setupOpen, setSetupOpen] = useState(openSetupFromUrl);
```

And replace the drawer's close wiring so dismissing also cleans the URL (prevents the drawer re-opening on refresh):

```tsx
      {setupOpen && (
        <SetupDrawer
          onClose={() => {
            setSetupOpen(false);
            if (openSetupFromUrl) router.replace("/timer");
          }}
          onCreate={handleCreate}
        />
      )}
```

- [ ] **Step 3: Verify and commit**

Run: `pnpm test && pnpm ts-check` — exit 0. `npx biome check src/components/timer/hub-view.tsx src/components/timer/match-view.tsx` — clean.

Browser: finish a standalone match → summary → "Novo jogo" → lands on `/timer` with the setup drawer already open at "Tipo"; closing it clears `?novo=1` from the URL.

```bash
git add src/components/timer/match-view.tsx src/components/timer/hub-view.tsx
git commit -m "feat(timer): summary 'Novo jogo' opens the setup drawer directly"
```

---

## Final verification

- [ ] `pnpm test && pnpm ts-check && pnpm build` — all exit 0; lint delta vs pre-plan HEAD is zero new errors.
- [ ] Full browser flow: `/timer` (no tournament matches listed, dated cards, visible confirmed delete, "Torneios" link) → `/timer/tournament` (delete tournament with confirm, "Cronómetro" link back) → run a tournament match (wake lock silent, no console errors) → finish a standalone match → "Novo jogo" opens setup.
- [ ] `git log --oneline` shows 7 conventional commits.
- [ ] Report: wake-lock sleep prevention needs a physical-device sanity check (Chrome Android / iOS Safari ≥16.4).

## Out of scope (known, deliberately excluded)

- Timer module i18n (dedicated deferred plan; new timer-module copy above stays PT).
- Editing a finished match's events / recomputing a finalized tournament result.
- Sound toggle mid-match; per-match config editing after creation.
