# Contexto de projecto para vários harnesses

## Objectivo

O contexto do JogaBola acompanha o repositório e é reutilizado por Codex, Claude Code e Antigravity. O utilizador descreve o trabalho a executar; não precisa de repetir no prompt a visão do produto, o stack ou as regras de negócio.

## Fontes canónicas

| Fonte | Conteúdo e autoridade |
| --- | --- |
| [`AGENTS.md`](../../AGENTS.md) | Regras comuns de trabalho, invariantes sempre activas e mapa da documentação. |
| [`PRODUCT.md`](../../.agents/context/PRODUCT.md) | Estratégia, utilizadores, proposta de valor, princípios de produto e direcção AI Club OS. |
| [`CONTEXT.md`](../../.agents/context/CONTEXT.md) | Vocabulário de domínio e regras de negócio que a aplicação deve preservar. |
| [`DESIGN.md`](../../.agents/context/DESIGN.md) | Sistema visual, acessibilidade e padrões de interface. |
| [`docs/adr/`](../adr/) | Decisões arquitecturais aprovadas. Um plano ou prompt não substitui um ADR. |
| [`docs/superpowers/plans/README.md`](../superpowers/plans/README.md) | Estado dos planos. Consultar o plano activo relevante antes de implementar. |
| [`docs/archive/`](../archive/) | Referência histórica. Não é a fila de execução nem substitui documentação actual. |

## Adaptadores por ferramenta

O repositório usa uma estrutura agnóstica centrada em `AGENTS.md` e `.agents/`:

| Caminho | Responsabilidade |
| --- | --- |
| `AGENTS.md` | Entrada única de instruções na raiz do repositório. |
| `.agents/context/` | Contexto canónico de produto, domínio e design (`PRODUCT.md`, `CONTEXT.md`, `DESIGN.md`). |
| `.agents/agents/` | Definições canónicas dos agentes especializados (`club-agent-runtime`, `club-domain`, `qa-integration-database`, `qa-journeys-ui`). |
| `.agents/skills/` | Skills partilhadas do projecto (`builder-business`, `dev-coder`). |
| `.agents/rules/` | Regras de activação e encaminhamento para as fontes canónicas. |

Pastas específicas de clientes locais (`.claude/`, `.codex/`, `.gemini/`) são ignoradas pelo Git e não devem guardar regras de negócio nem duplicar agentes ou skills.

Edita `AGENTS.md` ou os ficheiros em `.agents/context/`, nunca uma cópia específica de ferramenta. Se uma futura ferramenta não carregar `AGENTS.md`, cria localmente um symlink ou adaptador curto que encaminhe para `AGENTS.md` e `.agents/`; não copies regras de negócio para esse adaptador.

## Procedimento de cada tarefa

1. Receber `AGENTS.md` como instruções do repositório.
2. Antes de alterar produto ou domínio, consultar `.agents/context/PRODUCT.md` e `.agents/context/CONTEXT.md`.
3. Consultar o ADR da área e o plano activo no índice; para AI Club OS, usar `docs/superpowers/plans/2026-11-25-ai-club-os.md`.
4. Se o pedido entrar em conflito com uma regra ou ADR, explicar o conflito e propor a alteração documental apropriada antes de codificar.
5. Quando uma decisão de negócio mudar, actualizar a fonte canónica no mesmo trabalho. Não deixar a decisão apenas no histórico do chat ou num prompt.

## Contexto legado

O contexto importado `01-contexto-agente-ia.md` descreve um protótipo anterior com React Native/Expo e Supabase. Não é a fonte actual para arquitectura, stack, autenticação, autorização ou dados. Usa o estado vivo do repositório, `AGENTS.md`, `.agents/context/PRODUCT.md`, `.agents/context/CONTEXT.md` e ADRs.
