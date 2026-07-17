# Repository and Agent Structure Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate repository-local agent configuration, separate durable documentation from runtime state, and expose only active implementation plans in the daily workflow.

**Architecture:** `AGENTS.md` remains the canonical project-instruction interface, while `.agents/skills/` becomes the canonical implementation of repository-local skills and `.claude/skills` becomes an adapter symlink. Durable Superpowers plans remain under `docs/superpowers/`; completed, superseded, stale, and historical plans move to classified archives with a single index and updated backlinks.

**Tech Stack:** Git · Markdown · POSIX symlinks · Biome · TypeScript · Vitest · Next.js 16

**Specification:** `docs/superpowers/specs/2026-07-17-repository-agent-structure-design.md`

---

## File map

**Create:**

- `docs/superpowers/plans/README.md` — canonical plan index.
- `docs/archive/plans/completed/` — plans with implementation evidence.
- `docs/archive/plans/superseded/` — plans replaced by later decisions.
- `docs/archive/plans/needs-review/` — stale plans that must not be executed as written.
- `docs/archive/plans/historical/` — roadmaps and indexes retained as references.
- `docs/archive/advisor/2026-07-16/` — immutable advisor audit snapshot.
- `docs/archive/sessions/arena-ui-ux-progress.md` — durable part of the old runtime ledger.
- `.claude/skills` — symlink adapter to `../.agents/skills`.

**Modify:**

- `.gitignore` — distinguish canonical skills from runtime/tool caches.
- `AGENTS.md` — point the default implementation standard at `.agents/skills/`.
- `README.md` — document the canonical plan index and archive.
- `.agents/skills/dev-coder/SKILL.md` — retain the newer modular form of the duplicated skill.
- `.agents/skills/builder-business/SKILL.md` — repair its broken relative reference.
- Markdown files returned by the backlink scan — update moved plan paths only.

**Move:**

- `.claude/skills/integration-nextjs-app-router/` to
  `.agents/skills/integration-nextjs-app-router/` locally before installing the
  adapter.
- `.superpowers/sdd/progress.md` to
  `docs/archive/sessions/arena-ui-ux-progress.md`.
- `docs/advisor-plans/` contents to `docs/archive/advisor/2026-07-16/`.
- Existing Superpowers plans according to the classification table in Task 5.

**Remove from version control:**

- `.superpowers/brainstorm/56394-1784208816/.server-info`
- `.superpowers/brainstorm/56394-1784208816/cockpit-layout.html`
- `.superpowers/brainstorm/56394-1784208816/waiting-architecture.html`
- duplicated tracked implementation under `.claude/skills/dev-coder/` after the
  canonical copy and adapter have been verified.

---

### Task 1: Record the structural baseline

**Files:**

- Read: `AGENTS.md`
- Read: `.gitignore`
- Read: `.agents/skills/`
- Read: `.claude/skills/`
- Read: `docs/superpowers/plans/`
- Read: `docs/advisor-plans/`
- Read: `.superpowers/`

- [ ] **Step 1: Confirm a clean task boundary**

Run:

```bash
git status --short
```

Expected: only intentional changes for this plan, or a documented list of
unrelated user changes that will not be staged.

- [ ] **Step 2: Capture tracked files and symlink targets**

Run:

```bash
git ls-files AGENTS.md CLAUDE.md GEMINI.md '.agents/**' '.claude/**' \
  '.superpowers/**' 'docs/advisor-plans/**' 'docs/superpowers/**'
readlink CLAUDE.md
readlink GEMINI.md
```

Expected before migration:

- `CLAUDE.md` and `GEMINI.md` both resolve to `AGENTS.md`;
- `.claude/skills/dev-coder/` and `.superpowers/` contain tracked files;
- `.agents/skills/` is not yet tracked.

- [ ] **Step 3: Verify the duplication evidence**

Run:

```bash
diff -rq .agents/skills/react-doctor .claude/skills/react-doctor
diff -u .claude/skills/dev-coder/SKILL.md .agents/skills/dev-coder/SKILL.md
shasum .agents/skills/dev-coder/references/*.md \
  .claude/skills/dev-coder/references/*.md
```

Expected:

- `react-doctor` is identical;
- only `dev-coder/SKILL.md` differs;
- the `dev-coder` reference files are byte-identical.

- [ ] **Step 4: Capture every backlink that may need migration**

Run:

```bash
rg -n --hidden --glob '!node_modules/**' --glob '!.git/**' \
  --glob '!.next/**' \
  '(\.claude/skills|\.superpowers/|docs/advisor-plans|docs/superpowers/plans)' \
  . > /tmp/jogabola-structure-backlinks-before.txt
```

Expected: exit 0 and a reviewable baseline in
`/tmp/jogabola-structure-backlinks-before.txt`.

- [ ] **Step 5: Commit**

No commit. This task is read-only characterization.

---

### Task 2: Make `.agents/skills` canonical

**Files:**

- Modify: `.gitignore`
- Modify: `AGENTS.md`
- Modify: `.agents/skills/dev-coder/SKILL.md`
- Modify: `.agents/skills/builder-business/SKILL.md`
- Add: `.agents/skills/dev-coder/references/coder-agent.md`
- Add: `.agents/skills/dev-coder/references/ui-agent.md`
- Add: `.agents/skills/react-doctor/SKILL.md`
- Add: `.agents/skills/react-doctor/references/explain.md`
- Add: `.agents/skills/builder-business/SKILL.md`
- Add: `.agents/skills/builder-business/references/prd.md`
- Add: `.agents/skills/integration-nextjs-app-router/`
- Delete tracked duplicate: `.claude/skills/dev-coder/`
- Create symlink: `.claude/skills -> ../.agents/skills`

- [ ] **Step 1: Add the failing canonical-path checks**

Run before changing files:

```bash
test -L .claude/skills
test -n "$(git ls-files '.agents/skills/**')"
rg -n '\.claude/skills/dev-coder' AGENTS.md
```

Expected:

- the first two checks fail;
- the final command finds the stale path in `AGENTS.md`.

- [ ] **Step 2: Reconcile `dev-coder`**

Use the newer modular `.claude/skills/dev-coder/SKILL.md` as the canonical
`SKILL.md`. Its UI section delegates to `references/ui-agent.md`, whose content
is already byte-identical in both trees. Preserve every other current
`dev-coder` rule.

Run:

```bash
diff -u .claude/skills/dev-coder/SKILL.md \
  .agents/skills/dev-coder/SKILL.md
```

Expected after reconciliation: no semantic rule is lost; the only removed
duplication is UI detail already present in `references/ui-agent.md`.

- [ ] **Step 3: Repair the builder-business reference**

In `.agents/skills/builder-business/SKILL.md`, replace:

```markdown
[PRD Completo](.agent/skills/builder-business/references/prd.md)
```

with:

```markdown
[PRD Completo](references/prd.md)
```

- [ ] **Step 4: Make ignore rules explicit**

Replace the broad `.agents` and `.claude` rules with rules that:

- track repository-owned skills `dev-coder`, `react-doctor`,
  `builder-business`, and the preserved `integration-nextjs-app-router`;
- keep installed external skills such as `impeccable` reproducible through
  `skills-lock.json` but untracked;
- track `.claude/napkin.md` and either the directory adapter or thin adapter
  symlinks beneath `.claude/skills/`;
- keep other Claude/Codex runtime and settings ignored.

The relevant block should express:

```gitignore
.agents/*
!.agents/skills/
.agents/skills/*
!.agents/skills/dev-coder/
!.agents/skills/dev-coder/**
!.agents/skills/react-doctor/
!.agents/skills/react-doctor/**
!.agents/skills/builder-business/
!.agents/skills/builder-business/**
!.agents/skills/integration-nextjs-app-router/
!.agents/skills/integration-nextjs-app-router/**

.claude/*
!.claude/napkin.md
!.claude/skills
!.claude/skills/
!.claude/skills/*

.codex
!.codex/napkin.md
```

- [ ] **Step 5: Preserve Claude-only local skills and install the adapter**

Before replacing `.claude/skills`, move any Claude-only local directory, notably
`integration-nextjs-app-router`, into `.agents/skills/` and version it as a
preserved repository-local skill.

Remove the duplicated `.claude/skills` directory and create:

```bash
ln -s ../.agents/skills .claude/skills
```

Do not remove `.claude/napkin.md`.

- [ ] **Step 6: Update the project instruction**

In `AGENTS.md`, replace `.claude/skills/dev-coder/` with
`.agents/skills/dev-coder/`.

- [ ] **Step 7: Validate every local skill and referenced file**

Run this check for every `SKILL.md` under `.agents/skills/`, including locally
installed skills:

```bash
find .agents/skills -name SKILL.md -print0 |
  while IFS= read -r -d '' skill; do
    test "$(head -n 1 "$skill")" = "---" || exit 1
    rg -q '^name: .+' "$skill" || exit 1
    rg -q '^description: .+' "$skill" || exit 1
  done
```

Then validate local Markdown links from every skill Markdown file:

```bash
find .agents/skills -name '*.md' -print0 |
  while IFS= read -r -d '' markdown; do
    base="$(dirname "$markdown")"
    rg -o '\]\(([^)#]+)' "$markdown" |
      sed 's/^](//' |
      while IFS= read -r target; do
        case "$target" in
          http://*|https://*|mailto:*|\{\{*) continue ;;
        esac
        test -e "$base/$target" || {
          echo "Broken skill reference: $markdown -> $target"
          exit 1
        }
      done || exit 1
  done
```

Expected: both loops exit 0. Fix broken relative paths at their source; do not
silence missing references.

- [ ] **Step 8: Verify filesystem adapters**

Run:

```bash
test "$(readlink .claude/skills)" = "../.agents/skills"
test -f .agents/skills/dev-coder/SKILL.md
test -f .claude/skills/dev-coder/SKILL.md
test -f .agents/skills/dev-coder/references/ui-agent.md
test -f .agents/skills/react-doctor/references/explain.md
rg -n '\.claude/skills/dev-coder' AGENTS.md
rg -n '\.agent/skills/builder-business' .agents/skills/builder-business
```

Expected:

- all `test` commands exit 0;
- both `rg` commands return no matches.

- [ ] **Step 9: Smoke-test discovery through both agent harnesses**

If `claude` is installed, run a non-mutating prompt from the repository:

```bash
claude -p --allowedTools "" \
  "List only the names of repository-local skills currently discoverable. Do not use tools." \
  > /tmp/jogabola-claude-skills.txt
rg -q '^dev-coder$' /tmp/jogabola-claude-skills.txt
rg -q '^react-doctor$' /tmp/jogabola-claude-skills.txt
```

If `codex` is installed, run the equivalent non-mutating prompt:

```bash
codex exec --ephemeral --sandbox read-only \
  --output-last-message /tmp/jogabola-codex-skills.txt \
  "List only the names of repository-local skills currently discoverable. Do not use tools."
rg -q '^dev-coder$' /tmp/jogabola-codex-skills.txt
rg -q '^react-doctor$' /tmp/jogabola-codex-skills.txt
```

Expected: both harness outputs include `dev-coder` and `react-doctor` on their
own lines. Do not grant either process write tools.

If either installed harness does not discover skills through the directory
symlink, replace `.claude/skills` with a real directory containing one relative
symlink for every skill directory currently present under `.agents/skills/`:

```bash
rm .claude/skills
mkdir .claude/skills
find .agents/skills -mindepth 1 -maxdepth 1 -type d -print0 |
  while IFS= read -r -d '' skill_dir; do
    skill_name="$(basename "$skill_dir")"
    ln -s "../../.agents/skills/$skill_name" ".claude/skills/$skill_name"
  done
```

Repeat the harness smoke test after installing per-skill adapters.

If a harness executable or its authentication/network is unavailable, do not
claim its discovery is verified. Use the conservative per-skill adapter layout
and record the missing smoke test in the final report.

- [ ] **Step 10: Commit**

```bash
git add .gitignore AGENTS.md .agents/skills .claude/skills
git commit -m "chore(agents): canonicalize repository skills"
```

Before committing, inspect `git diff --cached --stat` and confirm no external
installed skill implementation was staged. Small adapter symlinks for installed
skills are allowed when the per-skill fallback is active.

---

### Task 3: Remove transient Superpowers runtime from version control

**Files:**

- Modify: `.gitignore`
- Move: `.superpowers/sdd/progress.md` to
  `docs/archive/sessions/arena-ui-ux-progress.md`
- Delete:
  `.superpowers/brainstorm/56394-1784208816/.server-info`
- Delete:
  `.superpowers/brainstorm/56394-1784208816/cockpit-layout.html`
- Delete:
  `.superpowers/brainstorm/56394-1784208816/waiting-architecture.html`

- [ ] **Step 1: Verify the runtime files are currently tracked**

Run:

```bash
git ls-files '.superpowers/**'
```

Expected: four tracked runtime files.

- [ ] **Step 2: Archive the useful ledger**

Use `git mv` to move `.superpowers/sdd/progress.md` to
`docs/archive/sessions/arena-ui-ux-progress.md`. Add this header above its
existing content:

```markdown
# Archived Arena UI/UX Session Progress

> Historical execution ledger archived from `.superpowers/sdd/progress.md` on
> 2026-07-17. The durable plan and verification evidence remain linked below.
```

- [ ] **Step 3: Remove transient browser artefacts**

Use `git rm` to remove the three tracked files under
`.superpowers/brainstorm/56394-1784208816/`. Do not archive the absolute path,
port metadata, or generated browser HTML.

- [ ] **Step 4: Ignore future runtime**

Add `.superpowers/` to `.gitignore`.

- [ ] **Step 5: Verify**

Run:

```bash
git ls-files '.superpowers/**'
test -f docs/archive/sessions/arena-ui-ux-progress.md
rg -n '/Users/|127\.0\.0\.1|localhost:[0-9]+' docs/archive/sessions
```

Expected:

- no tracked `.superpowers/` files;
- the archived ledger exists;
- no machine-local absolute path or transient server endpoint was archived.

- [ ] **Step 6: Commit**

```bash
git add .gitignore .superpowers docs/archive/sessions
git commit -m "chore(docs): archive durable agent session progress"
```

---

### Task 4: Archive the advisor snapshot

**Files:**

- Move: `docs/advisor-plans/README.md` to
  `docs/archive/advisor/2026-07-16/README.md`
- Move: `docs/advisor-plans/AUDIT.md` to
  `docs/archive/advisor/2026-07-16/AUDIT.md`
- Move: `docs/advisor-plans/001-integrate-hardening.md` to
  `docs/archive/advisor/2026-07-16/001-integrate-hardening.md`
- Move: `docs/advisor-plans/002-consent-analytics.md` to
  `docs/archive/advisor/2026-07-16/002-consent-analytics.md`
- Move: `docs/advisor-plans/003-auth-runtime.md` to
  `docs/archive/advisor/2026-07-16/003-auth-runtime.md`
- Move: `docs/advisor-plans/004-release-gate.md` to
  `docs/archive/advisor/2026-07-16/004-release-gate.md`
- Move: `docs/advisor-plans/005-captain-conversion.md` to
  `docs/archive/advisor/2026-07-16/005-captain-conversion.md`
- Move: `docs/advisor-plans/006-timer-pitch-ux.md` to
  `docs/archive/advisor/2026-07-16/006-timer-pitch-ux.md`

- [ ] **Step 1: Verify there are no external consumers**

Run:

```bash
rg -n 'docs/advisor-plans|advisor-plans/' . \
  --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!.next/**'
```

Expected: no references outside `docs/advisor-plans/`, or an explicit list to
update in Step 3.

- [ ] **Step 2: Move the snapshot with Git-aware moves**

Preserve every filename and the whole dated set under
`docs/archive/advisor/2026-07-16/`.

- [ ] **Step 3: Update any discovered backlinks**

Replace `docs/advisor-plans/` with
`docs/archive/advisor/2026-07-16/` only where Step 1 found a real link.

- [ ] **Step 4: Verify**

Run:

```bash
test ! -e docs/advisor-plans
test -f docs/archive/advisor/2026-07-16/README.md
test -f docs/archive/advisor/2026-07-16/AUDIT.md
find docs/archive/advisor/2026-07-16 -maxdepth 1 -type f | wc -l
```

Expected: the old directory is absent and the archive contains eight files.

- [ ] **Step 5: Commit**

```bash
git add docs/advisor-plans docs/archive/advisor
git commit -m "docs: archive 2026-07-16 advisor plans"
```

---

### Task 5: Classify Superpowers implementation plans

**Files:**

- Create: `docs/superpowers/plans/README.md`
- Move the files listed below.
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: Markdown backlinks returned by `rg`.

#### Completed

Move to `docs/archive/plans/completed/`:

- `001-verification-baseline.md`
- `002-server-action-auth-hardening.md`
- `003-guest-otp-rate-limiting.md`
- `004-finish-analytics-migration-dep-cleanup.md`
- `006-timer-cronometro-ux-fixes.md`
- `2026-05-02-homepage-redesign.md`
- `2026-05-06-freemium-i18n-roadmap.md`
- `2026-07-13-timer-growth-loop.md`
- `2026-07-14-timer-tournament.md`
- `2026-07-15-app-hardening-sweep.md`
- `2026-07-15-group-player-goals.md`
- `2026-07-15-timer-ux-sweep.md`
- `2026-07-16-arena-ui-ux-improvements.md`
- `co-capitao-implementacao.md`

Evidence includes the existing audit index, later plan status tables, matching
feature commits, the current source tree, and the Arena verification ledger.
Re-check the named evidence before each move. If evidence contradicts the table,
default that plan to `needs-review` and record the reason in the index.

#### Superseded

Move to `docs/archive/plans/superseded/`:

- `005-fix-stale-docs-and-readme.md`

Reason: the repository now uses `AGENTS.md` with `CLAUDE.md` and `GEMINI.md`
symlinks; the plan's duplicated-file instruction must not be executed.

#### Needs review

Move to `docs/archive/plans/needs-review/`:

- `2026-04-30-architecture-deepening.md`
- `2026-04-30-shadcn-migration.md`
- `2026-05-23-v3-interface-flow-improvements.md`
- `2026-05-25-codebase-refactor.md`
- `jogabola-plano-implementacao-pre-lancamento.md`
- `plano-agente-modais-mockup.md`

These plans have material drift or insufficient completion evidence. They remain
available but must not be executed without a fresh review against the live code.

#### Historical

Move to `docs/archive/plans/historical/`:

- `audit-plans-README.md`
- `mvp-implementation-roadmap.md`

The first is replaced by the new canonical index. The second is a mostly
completed product roadmap with an explicitly deferred domain item, not an
executable current plan.

- [ ] **Step 1: Re-check classification evidence**

For every file in `completed`, inspect:

```bash
git log --all --oneline -- <plan-path>
rg -n '<distinctive implementation symbol>' src
```

Use the existing status evidence already named in the plan where available.
Do not infer completion from age or unchecked boxes.

- [ ] **Step 2: Confirm the pre-move inventory**

Run:

```bash
find docs/superpowers/plans -maxdepth 1 -type f -name '*.md' -print | sort
```

Expected: the plan being executed plus the 23 existing Markdown files listed in
this task.

- [ ] **Step 3: Move plans into classified archives**

Use Git-aware moves and preserve each filename. Keep
`2026-07-17-repository-agent-structure.md` in
`docs/superpowers/plans/` as the active plan.

- [ ] **Step 4: Update every backlink**

Run:

```bash
rg -n 'docs/superpowers/plans/|plans/[0-9]{3}-' . \
  --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!.next/**'
```

Update links to moved files in specs, verification documents, design documents,
archived plans, `README.md`, and `AGENTS.md`. Do not rewrite historical prose
that merely discusses the former organization unless it is a clickable or
operational path.

- [ ] **Step 5: Create the canonical plan index**

Create `docs/superpowers/plans/README.md` with:

- a one-paragraph rule that only actionable, reviewed plans remain beside the
  index;
- a table containing state, date, title, dependencies, and current path for
  every plan;
- an `Active` section containing this plan;
- links to `completed`, `superseded`, `needs-review`, `historical`, and the
  advisor snapshot;
- the five canonical state definitions from the specification.

Generate the index after final moves, as recommended by spec review, to avoid
intermediate churn.

- [ ] **Step 6: Update repository entry points**

In `AGENTS.md` and `README.md`:

- describe `docs/superpowers/plans/README.md` as the plan entry point;
- describe `docs/archive/` as historical documentation;
- keep the Superpowers workflow canonical;
- do not add GSD instructions.

- [ ] **Step 7: Verify plan coverage and backlinks**

Run:

```bash
find docs/superpowers/plans docs/archive/plans \
  -type f -name '*.md' -print | sort
rg -n 'docs/advisor-plans|docs/superpowers/plans/(001-|002-|003-|004-|005-|006-|2026-04-30-|2026-05-02-|2026-05-06-|2026-05-23-|2026-05-25-|2026-07-13-|2026-07-14-|2026-07-15-|2026-07-16-|co-capitao|jogabola-plano|mvp-|plano-agente|audit-plans)' \
  . --hidden --glob '!node_modules/**' --glob '!.git/**' --glob '!.next/**' \
  --glob '!docs/superpowers/plans/2026-07-17-repository-agent-structure.md' \
  --glob '!docs/superpowers/specs/2026-07-17-repository-agent-structure-design.md'
```

Expected:

- every old plan exists at exactly one classified path;
- the second command returns no stale operational links and exits 1; the active
  migration plan and its specification are excluded because they intentionally
  document former paths.

- [ ] **Step 8: Commit**

```bash
git add AGENTS.md README.md docs/superpowers docs/archive
git commit -m "docs: classify and archive implementation plans"
```

---

### Task 6: Verify the repository interface

**Files:**

- Verify all files touched by Tasks 2–5.

- [ ] **Step 1: Verify symlinks and canonical skills**

Run:

```bash
test "$(readlink CLAUDE.md)" = "AGENTS.md"
test "$(readlink GEMINI.md)" = "AGENTS.md"
if test -L .claude/skills; then
  test "$(readlink .claude/skills)" = "../.agents/skills"
else
  find .agents/skills -mindepth 1 -maxdepth 1 -type d -print0 |
    while IFS= read -r -d '' skill_dir; do
      skill_name="$(basename "$skill_dir")"
      test "$(readlink ".claude/skills/$skill_name")" = \
        "../../.agents/skills/$skill_name" || exit 1
    done
fi
test -f .claude/skills/dev-coder/SKILL.md
test -f .agents/skills/dev-coder/references/ui-agent.md
git ls-files .claude/skills '.claude/skills/**'
git ls-files '.agents/skills/**'
```

Expected:

- all symlink checks pass;
- `.claude/skills` has no duplicated implementation beneath it;
- repository-owned canonical skills are tracked under `.agents/skills/`.

- [ ] **Step 2: Re-run full skill validation**

Re-run both loops from Task 2, Step 7 against every
`.agents/skills/**/SKILL.md` and every Markdown link below
`.agents/skills/`.

Expected: valid frontmatter for every skill and zero broken local references.

- [ ] **Step 3: Re-run both harness discovery checks**

Re-run the exact Claude and Codex commands from Task 2, Step 9. If a harness was
previously unavailable, report it explicitly and verify the conservative
per-skill adapter layout for every canonical skill instead:

```bash
find .agents/skills -mindepth 1 -maxdepth 1 -type d -print0 |
  while IFS= read -r -d '' skill_dir; do
    skill_name="$(basename "$skill_dir")"
    test -L ".claude/skills/$skill_name" || exit 1
    test -f ".claude/skills/$skill_name/SKILL.md" || exit 1
  done
```

Expected: both harnesses discover `dev-coder` and `react-doctor`, or the
documented conservative adapter checks exit 0 when a harness cannot be run.

- [ ] **Step 4: Verify references and runtime hygiene**

Run:

```bash
rg -n \
  'docs/advisor-plans|\.claude/skills/dev-coder|\.superpowers/sdd/progress' \
  AGENTS.md README.md docs/agents docs/design docs/verification \
  docs/superpowers/specs \
  --glob '!2026-07-17-repository-agent-structure-design.md'
git ls-files '.superpowers/**'
git diff --check
```

Expected:

- `rg` returns no matches and exits 1; that exit code means the stale-reference
  check passed;
- `git ls-files` prints nothing;
- `git diff --check` exits 0.

- [ ] **Step 5: Run the repository checks**

Run:

```bash
pnpm lint
pnpm ts-check
pnpm test
pnpm build
```

Expected: all commands exit 0. `pnpm build` may require network access for
`next/font`. Report existing third-party warnings separately.

- [ ] **Step 6: Inspect the final change set**

Run:

```bash
git status --short
git diff --stat HEAD~4..HEAD
git log -5 --oneline
```

Expected: only approved repository-structure changes plus the implementation
plan; no application source files changed.

- [ ] **Step 7: Commit verification evidence if documentation changed**

If verification requires correcting the plan index or a stale backlink:

```bash
git add AGENTS.md README.md .gitignore .agents .claude docs
git commit -m "docs: finalize repository structure verification"
```

Otherwise, do not create an empty commit.
