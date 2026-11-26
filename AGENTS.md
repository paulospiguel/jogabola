# JOGABOLA — Project Instructions

> Instruções comuns e ponto de entrada único e agnóstico para agentes de IA. Todos os ficheiros de contexto, agentes, skills e regras vivem em `.agents/` — edita só aqui e nas fontes canónicas referenciadas.

## What this project is
**JogaBola** — plataforma de gestão de equipas de futebol amador. Convocatórias, plantel, estatísticas, chat por evento, rankings, histórico de época.

## Direção do produto — aplicar em todas as tarefas

O JogaBola evolui para o **AI Club OS**: a plataforma operacional de clubes e equipas amadoras, com staff virtual de IA integrado nos fluxos reais do produto. Não transformar o produto num chatbot genérico nem substituir os fluxos existentes sem decisão explícita.

O primeiro ciclo valida um **Secretário** que prepara pedidos de disponibilidade, interpreta respostas dos atletas e ajuda o treinador/organizador a identificar presenças por confirmar. A pessoa responsável mantém o controlo: respostas ambíguas pedem esclarecimento e comunicações ao plantel são revistas antes do envio.

Qualquer agente tem identidade própria, âmbito limitado ao clube/equipa autorizado, permissões verificadas no servidor, limites de custo e registo das ações. Repetições de eventos não podem duplicar efeitos; revogar o agente impede novas ações. Preservar o histórico e os percursos recreativos existentes. Não introduzir workers alojados, voz ou base vetorial sem necessidade validada por uso ou piloto.

O contexto canónico não depende do prompt da tarefa. O pedido do utilizador define o trabalho actual; não substitui estas regras nem as regras de domínio. Se uma alteração exigir mudar a estratégia ou uma regra de negócio, actualiza primeiro a documentação canónica e regista decisões arquitecturais em ADRs.

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
| `.agents/context/PRODUCT.md` | Intenção de produto, utilizadores, princípios |
| `.agents/context/CONTEXT.md` | Glossário de domínio (Convocatória, MatchSession, Racha/Payment...) e convenções de código |
| `.agents/context/DESIGN.md` | Design system — tokens, tipografia, componentes, microinterações |
| `.agents/agents/` | Definições canónicas dos agentes especializados |
| `.agents/skills/` | Skills do projecto (`builder-business`, `dev-coder`) |
| `.agents/rules/` | Regras de activação e encaminhamento para as fontes canónicas |
| `docs/agents/harness-context.md` | Como os clientes de IA consomem o contexto partilhado |
| `docs/adr/` | Decisões de arquitetura registadas |
| `docs/superpowers/plans/README.md` | Índice canónico dos planos de implementação revistos e accionáveis |
| `docs/archive/` | Documentação histórica, planos classificados e registos preservados |

Antes de uma alteração de produto, lê `.agents/context/PRODUCT.md` e `.agents/context/CONTEXT.md`; consulta o ADR e o plano activo da área. Usa `docs/agents/harness-context.md` para saber onde manter instruções partilhadas. Não peças ao utilizador para repetir contexto já documentado.

## Workflow de agentes
O fluxo canónico deste repositório é o **Superpowers** (brainstorming → writing-plans → executing-plans → verification-before-completion). Começar sempre pelo índice `docs/superpowers/plans/README.md`; apenas planos revistos e accionáveis permanecem ao lado desse índice. `docs/archive/` conserva documentação histórica e não é uma fila de execução. Não usar o pipeline GSD (`/gsd:*`) neste repositório.

A estrutura de agentes e skills é agnóstica e centralizada em `.agents/`:
- `.agents/agents/` — definições canónicas dos agentes especializados (`club-agent-runtime`, `club-domain`, `qa-integration-database`, `qa-journeys-ui`).
- `.agents/skills/` — skills do projecto (`builder-business`, `dev-coder`). A skill `dev-coder` (`.agents/skills/dev-coder/`) é o standard de implementação por omissão: arquitetura, regras de TypeScript/React, Server Actions, e tokens visuais Arena.
- `.agents/rules/` — adaptadores de activação para as fontes canónicas.

## Agent skills

### Issue tracker

Issues e PRDs vivem no GitHub Issues deste repositório. Ver `docs/agents/issue-tracker.md`.

### Triage labels

Usar `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human` e `wontfix`. Ver `docs/agents/triage-labels.md`.

### Domain docs

Repositório single-context com `.agents/context/CONTEXT.md` e ADRs globais em `docs/adr/`. Ver `docs/agents/domain.md`.

### Especialistas de QA

Em alterações não triviais, usa os agentes de QA quando a análise puder decorrer de forma independente: `qa-integration-database` para Server Actions, autenticação, Drizzle/Postgres e integrações externas; `qa-journeys-ui` para percursos completos, interface responsiva, acessibilidade e localização. Se a alteração abranger ambas as áreas, atribui um âmbito distinto a cada agente e consolida as evidências antes de reportar. Por omissão, são revisores sem escrita e não podem delegar trabalho. Ver `docs/agents/qa-subagents.md` para escolher os agentes e seguir as regras de segurança e passagem de resultados.

## Verificação
`pnpm lint` · `pnpm ts-check` · `pnpm test` · `pnpm build`
