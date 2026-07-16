# Domain Docs

Regras para as skills consumirem a documentação de domínio do JogaBola antes de explorarem ou alterarem código.

## Antes de explorar

- Ler `CONTEXT.md` na raiz para vocabulário, entidades e convenções.
- Ler os ADRs de `docs/adr/` que afetem a área em análise.
- Ler `PRODUCT.md` para intenção, público e princípios de produto.
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
