# Domain Docs

Regras para as skills consumirem a documentação de domínio do JogaBola antes de explorarem ou alterarem código.

## Antes de explorar

- Ler `AGENTS.md` para as regras comuns e a direcção actual AI Club OS; não depender de instruções repetidas no prompt.
- Ler `CONTEXT.md` na raiz para vocabulário, entidades e convenções.
- Ler os ADRs de `docs/adr/` que afetem a área em análise.
- Ler `PRODUCT.md` para intenção, público e princípios de produto.
- Para o primeiro ciclo AI Club OS, ler também `docs/superpowers/plans/2026-11-25-ai-club-os.md` e confirmar a etapa activa no índice.
- Ler `DESIGN.md` para tokens e padrões de interface quando houver impacto visual.

Este é um repositório single-context. Não existe `CONTEXT-MAP.md` nem documentação de domínio separada por pacote.

## ADRs atuais

- `docs/adr/0001-defer-external-league-model.md`
- `docs/adr/0002-ably-realtime-event-chat.md`

## Usar o vocabulário do glossário

Ao nomear conceitos em issues, hipóteses, testes ou propostas, usar o termo definido em `CONTEXT.md`. Não introduzir sinónimos quando o glossário estabelece uma expressão canónica.

Se um conceito relevante não existir no glossário, registar a lacuna em vez de inventar silenciosamente uma nova linguagem de domínio.

## Conflitos com ADRs

Se uma proposta contrariar um ADR, indicar explicitamente o conflito e a razão para reconsiderar a decisão, sem a substituir silenciosamente.

## Contexto partilhado entre harnesses

`AGENTS.md`, `PRODUCT.md` e `CONTEXT.md` são as fontes canónicas partilhadas. Codex, Claude Code e Antigravity devem consumir essas fontes; ficheiros específicos de cada ferramenta podem adaptar o carregamento, mas não devem copiar nem redefinir regras de negócio. Ver [harness-context.md](harness-context.md).
