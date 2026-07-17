# Repository and Agent Structure Consolidation

Date: 2026-07-17  
Status: Approved design

## Objective

Make the JogaBola repository easier to navigate and safer for developers and
agents by establishing one canonical location for each kind of durable
information:

- project instructions;
- local agent skills;
- active implementation plans;
- historical plans and audits;
- agent-specific runtime state.

This change is organizational. It must not refactor application behaviour.

## Confirmed repository conventions

The existing Matt Pocock skill setup remains unchanged:

- GitHub Issues is the canonical issue tracker for
  `paulospiguel/jogabola`;
- triage uses `needs-triage`, `needs-info`, `ready-for-agent`,
  `ready-for-human`, and `wontfix`;
- the repository is single-context, with `CONTEXT.md` and global ADRs in
  `docs/adr/`;
- `AGENTS.md` and `docs/agents/*.md` already describe these conventions
  correctly.

## Canonical structure

The repository will expose four clear operational interfaces:

```text
AGENTS.md                    # canonical project instructions
CLAUDE.md -> AGENTS.md       # Claude adapter
GEMINI.md -> AGENTS.md       # Gemini adapter

.agents/
└── skills/                  # canonical implementation of local skills

.claude/
├── skills -> ../.agents/skills
└── napkin.md                # Claude-specific memory

.codex/
└── napkin.md                # Codex-specific memory

docs/
├── agents/                  # engineering-skill configuration
├── adr/                     # architectural decisions
├── superpowers/
│   ├── plans/               # active implementation plans and index
│   └── specs/               # durable specifications
└── archive/
    ├── plans/
    │   ├── completed/
    │   ├── superseded/
    │   ├── needs-review/
    │   └── historical/
    ├── advisor/2026-07-16/
    └── sessions/
```

`PRODUCT.md`, `CONTEXT.md`, and `DESIGN.md` remain at the root because they are
high-value entry points for both humans and agents.

## Agent skill consolidation

`.agents/skills/` becomes the only versioned implementation of repository-local
skills. `.claude/skills` becomes an adapter symlink to `../.agents/skills`.
Codex continues to discover `.agents/skills/` directly.

Before replacing the duplicated directories:

1. compare every skill present in `.agents/skills/` and `.claude/skills/`;
2. merge divergent implementations semantically rather than selecting one
   blindly;
3. preserve the stricter and more current project rules;
4. move Claude-only skills into the canonical directory;
5. verify frontmatter, referenced files, and discovery through both paths.

`skills-lock.json` remains the source record for externally installed skills.
The Claude and Codex napkins remain separate because they have different
consumers and content.

If a tool cannot follow the directory symlink, the fallback is a thin adapter
symlink per skill. Duplicated skill implementations must not be restored.

## Plan lifecycle and archive

Every implementation plan receives one of five states:

- `active`: valid and currently actionable;
- `needs-review`: potentially useful but too stale to execute safely;
- `completed`: implementation is confirmed complete;
- `superseded`: replaced by a later decision or plan;
- `historical`: retained only as an audit, roadmap, or reference.

Classification must use evidence from the live code, commits, verification
documents, and later plans. Unchecked boxes alone are not evidence that a plan
is still active.

The durable plan interface is:

```text
docs/superpowers/plans/
├── README.md
└── <active plans>.md
```

The index records each plan's state, date, topic, dependencies, and location.
It also links to archived groups so historical work remains discoverable.

Migration rules:

- archive all of `docs/advisor-plans/` as a dated snapshot under
  `docs/archive/advisor/2026-07-16/`;
- mark `005-fix-stale-docs-and-readme.md` as superseded because its duplicated
  `CLAUDE.md`/`GEMINI.md` design was replaced by the canonical `AGENTS.md`
  symlink model;
- mark `2026-07-16-arena-ui-ux-improvements.md` as completed based on its
  progress ledger and verification document;
- place plans without sufficient completion evidence in `needs-review`;
- do not archive specifications or ADRs automatically when an implementation
  plan completes;
- update all versioned Markdown backlinks after every move.

## Runtime state

`.superpowers/` is runtime state and must not be a durable documentation
interface.

The useful content from `.superpowers/sdd/progress.md` is archived as a session
summary under `docs/archive/sessions/`. Transient browser HTML, local ports,
absolute paths, and server metadata are removed from version control.

`.superpowers/`, `.playwright-cli/`, worktrees, build output, and local caches
remain ignored. Agent-specific settings can remain in their tool directories
when they are not durable project documentation.

## Migration sequence

The change is executed in four independently verifiable phases:

1. **Canonical instructions**
   - preserve `AGENTS.md`;
   - validate the Claude and Gemini symlinks;
   - replace stale direct references to `.claude/skills/`.

2. **Canonical skills**
   - reconcile divergent skill implementations;
   - version `.agents/skills/`;
   - install the `.claude/skills` adapter;
   - verify discovery and referenced resources.

3. **Durable documentation**
   - create the plan index;
   - classify and move plans with Git-aware moves;
   - archive the advisor snapshot;
   - update all backlinks.

4. **Runtime cleanup**
   - preserve the useful session ledger;
   - remove transient `.superpowers/` files from version control;
   - make ignore rules explicit.

No phase may revert unrelated user work.

## Error handling and rollback

- A plan with ambiguous evidence defaults to `needs-review`.
- A skill with divergent content is not replaced until its rules and referenced
  files have been reconciled.
- A failed symlink discovery check triggers the per-skill adapter fallback.
- A move with unresolved backlinks is not considered complete.
- Git-aware moves preserve file history and make each phase independently
  reviewable and reversible.

## Verification

Repository-structure verification:

- `CLAUDE.md` and `GEMINI.md` resolve to `AGENTS.md`;
- `.claude/skills` resolves to `.agents/skills`, or to verified per-skill
  adapters if the directory adapter is unsupported;
- every local skill has valid frontmatter and all referenced files exist;
- no duplicated skill implementation remains;
- no versioned reference points to removed paths;
- the plan index links to every active and archived plan;
- runtime-only `.superpowers/` files are no longer tracked;
- `git diff --check` passes.

Application verification:

```bash
pnpm lint
pnpm ts-check
pnpm test
pnpm build
```

The build may require network access for `next/font`. Existing third-party
warnings are reported separately and do not count as structural failures unless
they make a command exit non-zero.

## Out of scope

- application feature work;
- source-code architecture refactors;
- changing the issue tracker or triage vocabulary;
- splitting the repository into multiple domain contexts;
- merging Claude and Codex napkins;
- deleting historical information that has not first been classified.
