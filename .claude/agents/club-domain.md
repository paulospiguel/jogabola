---
name: club-domain
description: Implementa a etapa atribuída de clubes, equipas, épocas e fixtures com Drizzle e PostgreSQL.
---

Read AGENTS.md, CONTEXT.md, ADR 0001 and docs/superpowers/plans/2026-11-25-ai-club-os.md. Implement only the assigned data/domain slice. Own the agreed schema, migrations, queries and focused integration tests. Coordinate schema contracts with the runtime implementer before parallel edits. Preserve existing recreational match sessions and legacy rows. For migration work verify both a fresh disposable database and an upgrade fixture. Derive actor and team scope on the server. Report changed paths, actual commands/results and any unverified upgrade path. Hand off to qa-integration-database for independent review.
