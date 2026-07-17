# Índice de planos de implementação

Apenas planos revistos, accionáveis e prontos para execução permanecem neste directório ao lado deste índice. O fluxo canónico é Superpowers; planos arquivados são evidência e contexto, não uma fila de trabalho.

## Estados

- **Active** — plano revisto, accionável e actualmente elegível para execução.
- **Needs review** — plano com deriva ou evidência insuficiente; exige nova revisão contra o código vivo antes de poder ser executado.
- **Completed** — plano com evidência concreta de implementação, como commits, símbolos vivos ou verificação registada.
- **Superseded** — plano substituído por uma decisão ou implementação posterior e que já não deve ser executado.
- **Historical** — roteiro, auditoria ou índice preservado apenas como contexto histórico.

## Active

| Estado | Data | Título | Dependências | Caminho actual |
| --- | --- | --- | --- | --- |
| Active | 2026-07-17 | Repository and Agent Structure Consolidation | — | [Plano](2026-07-17-repository-agent-structure.md) |

## Completed

| Estado | Data | Título | Dependências | Caminho actual |
| --- | --- | --- | --- | --- |
| Completed | 2026-07-11 | Verification baseline — vitest, CI, first tests | — | [Plano](../../archive/plans/completed/001-verification-baseline.md) |
| Completed | 2026-07-11 | Auth/authz on payment, attendance and chat-token surfaces | 001 | [Plano](../../archive/plans/completed/002-server-action-auth-hardening.md) |
| Completed | 2026-07-11 | Guest OTP rate limiting and lockout | 001; após 002 | [Plano](../../archive/plans/completed/003-guest-otp-rate-limiting.md) |
| Completed | 2026-07-11 | Finish PostHog → Statsig migration and dependency cleanup | — | [Plano](../../archive/plans/completed/004-finish-analytics-migration-dep-cleanup.md) |
| Completed | 2026-07-13 | Cronómetro UX fixes | — | [Plano](../../archive/plans/completed/006-timer-cronometro-ux-fixes.md) |
| Completed | 2026-05-02 | Homepage Redesign | — | [Plano](../../archive/plans/completed/2026-05-02-homepage-redesign.md) |
| Completed | 2026-05-06 | Freemium, i18n Audit, Roadmap Page & UI Cleanup | — | [Plano](../../archive/plans/completed/2026-05-06-freemium-i18n-roadmap.md) |
| Completed | 2026-07-13 | Timer Growth Loop | — | [Plano](../../archive/plans/completed/2026-07-13-timer-growth-loop.md) |
| Completed | 2026-07-14 | Mini-torneio | Timer existente | [Plano](../../archive/plans/completed/2026-07-14-timer-tournament.md) |
| Completed | 2026-07-15 | App Hardening Sweep | Auditoria de 2026-07-11; plano 005 parcialmente absorvido | [Plano](../../archive/plans/completed/2026-07-15-app-hardening-sweep.md) |
| Completed | 2026-07-15 | Group Player Goals | Timer existente | [Plano](../../archive/plans/completed/2026-07-15-group-player-goals.md) |
| Completed | 2026-07-15 | Timer UX Sweep | Timer e mini-torneio | [Plano](../../archive/plans/completed/2026-07-15-timer-ux-sweep.md) |
| Completed | 2026-07-16 | Arena UI/UX Improvements | Especificação Arena UI/UX | [Plano](../../archive/plans/completed/2026-07-16-arena-ui-ux-improvements.md) |
| Completed | 2026-06-01 | Co-capitão — guia de implementação | `withAuthAction`; permissões de equipa | [Plano](../../archive/plans/completed/co-capitao-implementacao.md) |

## Superseded

| Estado | Data | Título | Dependências | Caminho actual |
| --- | --- | --- | --- | --- |
| Superseded | 2026-07-11 | Replace stale agent instructions and add a real README | —; substituído por `AGENTS.md` e adaptadores symlink | [Plano](../../archive/plans/superseded/005-fix-stale-docs-and-readme.md) |

## Needs review

| Estado | Data | Título | Dependências | Caminho actual |
| --- | --- | --- | --- | --- |
| Needs review | 2026-04-30 | Architecture Deepening | — | [Plano](../../archive/plans/needs-review/2026-04-30-architecture-deepening.md) |
| Needs review | 2026-04-30 | shadcn/ui Migration | Instalação de primitives shadcn | [Plano](../../archive/plans/needs-review/2026-04-30-shadcn-migration.md) |
| Needs review | 2026-05-23 | JogaBola v3 Interface Flow Improvements | Design standalone v3 | [Plano](../../archive/plans/needs-review/2026-05-23-v3-interface-flow-improvements.md) |
| Needs review | 2026-05-25 | Refactor da codebase JogaBola | — | [Plano](../../archive/plans/needs-review/2026-05-25-codebase-refactor.md) |
| Needs review | 2026-06-01 | Plano de Implementação Pré-Lançamento | Branch `release02`; serviços externos | [Plano](../../archive/plans/needs-review/jogabola-plano-implementacao-pre-lancamento.md) |
| Needs review | 2026-06-22 | Remover mockup e corrigir modais desktop | Branch `release02`; mockup v3 | [Plano](../../archive/plans/needs-review/plano-agente-modais-mockup.md) |

## Historical

| Estado | Data | Título | Dependências | Caminho actual |
| --- | --- | --- | --- | --- |
| Historical | 2026-07-11 | Implementation Plans — auditoria e estado | Planos 001–006 | [Documento](../../archive/plans/historical/audit-plans-README.md) |
| Historical | 2026-05-13 | Plano de Implementação MVP | — | [Documento](../../archive/plans/historical/mvp-implementation-roadmap.md) |

## Arquivos relacionados

- [Planos concluídos](../../archive/plans/completed/)
- [Planos substituídos](../../archive/plans/superseded/)
- [Planos que exigem revisão](../../archive/plans/needs-review/)
- [Planos históricos](../../archive/plans/historical/)
- [Snapshot do advisor de 2026-07-16](../../archive/advisor/2026-07-16/)
