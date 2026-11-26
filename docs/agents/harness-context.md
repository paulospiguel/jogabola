# Contexto de projecto para vários harnesses

## Objectivo

O contexto do JogaBola acompanha o repositório e é reutilizado por Codex, Claude Code e Antigravity. O utilizador descreve o trabalho a executar; não precisa de repetir no prompt a visão do produto, o stack ou as regras de negócio.

## Fontes canónicas

| Fonte | Conteúdo e autoridade |
| --- | --- |
| [`AGENTS.md`](../../AGENTS.md) | Regras comuns de trabalho, invariantes sempre activas e mapa da documentação. |
| [`PRODUCT.md`](../../PRODUCT.md) | Estratégia, utilizadores, proposta de valor, princípios de produto e direcção AI Club OS. |
| [`CONTEXT.md`](../../CONTEXT.md) | Vocabulário de domínio e regras de negócio que a aplicação deve preservar. |
| [`DESIGN.md`](../../DESIGN.md) | Sistema visual, acessibilidade e padrões de interface. |
| [`docs/adr/`](../adr/) | Decisões arquitecturais aprovadas. Um plano ou prompt não substitui um ADR. |
| [`docs/superpowers/plans/README.md`](../superpowers/plans/README.md) | Estado dos planos. Consultar o plano activo relevante antes de implementar. |
| [`docs/archive/`](../archive/) | Referência histórica. Não é a fila de execução nem substitui documentação actual. |

## Adaptadores por ferramenta

| Harness | Entrada partilhada no repositório | Conteúdo específico da ferramenta |
| --- | --- | --- |
| Codex | `AGENTS.md` e `.agents/skills/` | `.codex/agents/` define agentes especializados; `.codex/napkin.md` é memória operacional, não fonte de regras de negócio. |
| Claude Code | `CLAUDE.md` é symlink para `AGENTS.md`; skills apontam para `.agents/skills/` | `.claude/agents/` define agentes especializados; `.claude/napkin.md` é memória operacional, não fonte de regras de negócio. |
| Antigravity | Lê `AGENTS.md`, `GEMINI.md` e `.agents/`; `GEMINI.md` é symlink para `AGENTS.md` | `.agents/rules/` contém apenas regras de activação/referência específicas do Antigravity; `.agents/skills/` contém skills partilhadas. |

Os symlinks mantêm um único conjunto de instruções: edita `AGENTS.md`, nunca uma cópia específica do harness. Os ficheiros em `.agents/rules/` são adaptadores de carregamento do Antigravity; encaminham para as fontes canónicas e não redefinem regras de negócio. Se uma futura ferramenta não carregar `AGENTS.md`, cria um adaptador curto que encaminhe para as fontes canónicas; não copies regras de negócio para esse adaptador.

## Procedimento de cada tarefa

1. Receber `AGENTS.md` como instruções do repositório.
2. Antes de alterar produto ou domínio, consultar `PRODUCT.md` e `CONTEXT.md`.
3. Consultar o ADR da área e o plano activo no índice; para AI Club OS, usar `docs/superpowers/plans/2026-11-25-ai-club-os.md`.
4. Se o pedido entrar em conflito com uma regra ou ADR, explicar o conflito e propor a alteração documental apropriada antes de codificar.
5. Quando uma decisão de negócio mudar, actualizar a fonte canónica no mesmo trabalho. Não deixar a decisão apenas no histórico do chat, num napkin ou num prompt.

## Contexto legado

O contexto importado `01-contexto-agente-ia.md` descreve um protótipo anterior com React Native/Expo e Supabase. Não é a fonte actual para arquitectura, stack, autenticação, autorização ou dados. Usa o estado vivo do repositório, `AGENTS.md`, `PRODUCT.md`, `CONTEXT.md` e ADRs.
