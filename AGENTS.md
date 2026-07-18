# JOGABOLA — Project Instructions

> Fonte única para todas as ferramentas de IA neste repositório (Claude Code, Codex CLI). `CLAUDE.md` e `GEMINI.md` são symlinks para este ficheiro — edita só aqui.

## What this project is
**JogaBola** — plataforma de gestão de equipas de futebol amador. Convocatórias, plantel, estatísticas, chat por evento, rankings, histórico de época.

## Idioma
**Sempre em Português europeu (PT-PT)** na UI e nas respostas ao utilizador. Identificadores e comentários de código em inglês. Tom direto, próximo, desportivo.

## Stack
Next.js 16 (App Router, `next dev --turbo`) · React 19 · TypeScript · pnpm · Drizzle ORM + Postgres · better-auth (+ passkey) · Ably (chat em tempo real) · next-intl · Tailwind CSS 4 · Statsig (analytics).

## Internacionalização (i18n) — MANDATÓRIO
- **Zero Hardcoded Text**: nunca adicionar texto diretamente nos componentes. Usar sempre `useTranslations` ou `getTranslations`.
- **Sincronização de Locales**: sempre que uma chave for adicionada, incluir em **todos** os ficheiros de tradução: `pt.json`, `en.json`, `es.json`, `fr.json`.
- **Server Actions First**: preferir sempre Server Actions em vez de rotas de API (REST) para lógica de backend, incluindo uploads, mutações e queries complexas.
- **Idioma Base**: desenvolvimento focado em PT-PT, mas paridade com as outras línguas é obrigatória em cada alteração.

## Padrões a manter
- **Mobile-first**, mas o desktop não é uma versão "esticada" — tem layout próprio (sidebar, drawers, mais densidade).
- **Microinterações sempre** — `.press` / `.btn-press` em qualquer clicável, fade entre ecrãs, stagger em listas.
- **Empty states** com ícone + título + sub + CTA.
- **Iconografia** stroke-based, nunca emoji (exceto 🏆 para campeão e bandeiras).

## Documentação — ler antes de codificar
| Ficheiro | Conteúdo |
|---|---|
| `PRODUCT.md` | Intenção de produto, utilizadores, princípios |
| `CONTEXT.md` | Glossário de domínio (Convocatória, MatchSession, Racha/Payment...) e convenções de código |
| `DESIGN.md` | Design system — tokens, tipografia, componentes, microinterações |
| `docs/adr/` | Decisões de arquitetura registadas |
| `docs/superpowers/plans/README.md` | Índice canónico dos planos de implementação revistos e accionáveis |
| `docs/archive/` | Documentação histórica, planos classificados e registos preservados |

## Workflow de agentes
O fluxo canónico deste repositório é o **Superpowers** (brainstorming → writing-plans → executing-plans → verification-before-completion). Começar sempre pelo índice `docs/superpowers/plans/README.md`; apenas planos revistos e accionáveis permanecem ao lado desse índice. `docs/archive/` conserva documentação histórica e não é uma fila de execução. Não usar o pipeline GSD (`/gsd:*`) neste repositório.

A skill `dev-coder` (`.agents/skills/dev-coder/`) é o standard de implementação por omissão: arquitetura, regras de TypeScript/React, Server Actions, e tokens visuais Arena.

## Agent skills

### Issue tracker

Issues e PRDs vivem no GitHub Issues deste repositório. Ver `docs/agents/issue-tracker.md`.

### Triage labels

Usar `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human` e `wontfix`. Ver `docs/agents/triage-labels.md`.

### Domain docs

Repositório single-context com `CONTEXT.md` e ADRs globais em `docs/adr/`. Ver `docs/agents/domain.md`.

## Verificação
`pnpm lint` · `pnpm ts-check` · `pnpm test` · `pnpm build`
