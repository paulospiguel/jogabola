# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-13] Prefer repo-local inspection before proposing changes**
   Do instead: read the relevant instructions, skills, and local project files before deciding on edits or commands.
2. **[2026-03-13] Validate every locale when adding `next-intl` keys**
   Do instead: update all language JSON files in the same change and run a JSON parse check plus `ts-check` before wrapping up.

## Shell & Command Reliability
1. **[2026-03-13] Use fast file discovery first**
   Do instead: prefer `rg` and focused `sed`/`ls` reads over broad scans or slower alternatives.

## User Directives
1. **[2026-05-06] Future UI must follow Jogabola design system**
   Do instead: use existing project tokens/patterns first: dark transparent surfaces, `border-default`, `text-*`, neon mint focus, arena green selection/primary states, and repo typography before introducing external visual styles.
2. **[2026-03-13] Use required skills when the task matches**
   Do instead: load the named or obviously relevant skill, follow its workflow, and keep the explanation concise.
