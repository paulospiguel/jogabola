# Plano 006: Tornar o cronómetro seguro para uso em campo

> **Drift check:** `git diff --stat 2c1eb85..HEAD -- src/components/timer`  
> Mudança no contrato `onConfirm` ou store é STOP até atualizar os testes de caracterização.

## Estado

- **Prioridade:** P1
- **Esforço:** S
- **Risco:** Baixo
- **Depende de:** 004
- **Categoria:** bug/UX
- **Planeado em:** `2c1eb85`, 2026-07-16

## Porque importa

Em campo, cada toque tem de produzir um resultado previsível. Hoje, escrever um nome novo e carregar em “Registar golo” ignora o nome sem aviso; além disso, os emojis quebram a iconografia stroke-based definida pelo projeto.

## Estado atual

- `src/components/timer/log-goal-sheet.tsx:70-76`: confirmar usa apenas o `scorer` selecionado.
- `src/components/timer/player-picker.tsx:124-133`: um nome digitado exige ação separada “Adicionar jogador”.
- `src/components/timer/match-controls.tsx:49` e `event-timeline.tsx:28`: usam emoji de bola.
- Agrupamento/remover golo mais recente está correto e deve permanecer coberto.

## Âmbito

**Incluído:** `log-goal-sheet.tsx`, `player-picker.tsx`, `match-controls.tsx`, `event-timeline.tsx`, helper puro novo `resolve-goal-scorer.ts` e `resolve-goal-scorer.test.ts`.  
**Excluído:** modelo de dados, regras do torneio, Testing Library/Playwright e formato persistido de jogos.

## Passos

1. Extrair para `resolve-goal-scorer.ts` uma função pura que decide entre jogador selecionado, nome novo normalizado e “sem marcador”. Nome novo não vazio deve ser criado/selecionado antes de confirmar; “sem marcador” exige escolha explícita.
2. No picker, Enter com texto adiciona e seleciona; Enter seguinte confirma. Não oferecer comportamento alternativo ao executor.
3. Substituir emojis visuais por ícones Lucide/stroke; emojis em texto de partilha ficam fora de scope.
4. Testar a função pura: nome novo, whitespace, jogador existente e sem marcador explícito. Manter os testes existentes de agrupamento e remoção.
5. Validar manualmente teclado, alvos ≥44 px, contraste e uso com uma mão em 390×844.

**Verificação:**

```bash
pnpm exec vitest run src/components/timer/resolve-goal-scorer.test.ts src/components/timer/timeline-items.test.ts
pnpm test
pnpm lint
pnpm ts-check
pnpm build
```

## Critérios de conclusão

- [ ] Nenhum nome digitado é descartado silenciosamente.
- [ ] Agrupamento e remoção mais recente continuam corretos.
- [ ] Controlos visuais não usam emoji e respeitam o design system.
- [ ] Fluxo completo exige no máximo dois toques após escolher a equipa.

## Test plan

- Usar testes node puros, compatíveis com `vitest.config.ts`; não introduzir DOM harness.
- UAT manual: nome novo por teclado, marcador existente, sem marcador explícito, dois golos e remoção do mais recente.

## STOP

- A criação automática de jogador altera IDs/partilha de resultados: parar e definir migração/compatibilidade.
- Qualquer alteração quebra jogos guardados existentes.

## Manutenção

O helper puro deve continuar independente de React/store; mudanças no formato persistido exigem plano de migração separado.
