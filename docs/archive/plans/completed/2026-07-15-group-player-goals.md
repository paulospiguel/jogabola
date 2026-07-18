# Group Player Goals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar uma única linha por jogador na cronologia, com todos os tempos dos seus golos, removendo apenas o golo mais recente do grupo.

**Architecture:** Manter `Match.events` inalterado e introduzir uma transformação pura de eventos persistidos para itens de apresentação. O `EventTimeline` passa a renderizar grupos de golos ou cartões individuais, usando o ID de remoção calculado pela transformação.

**Tech Stack:** React 19, TypeScript, Vitest, Framer Motion, Tailwind CSS 4.

---

### Task 1: Transformar eventos em itens de cronologia

**Files:**
- Create: `src/components/timer/timeline-items.ts`
- Create: `src/components/timer/timeline-items.test.ts`

- [ ] **Step 1: Escrever os testes que falham**

Criar fixtures mínimas de `MatchEvent` e testar `buildTimelineItems(events)`:

```ts
const events: MatchEvent[] = [
  goal("g1", 12 * 60, "A", "rui"),
  card("c1", 20 * 60, "A", "rui"),
  goal("g2", 27 * 60, "A", "rui"),
];

expect(buildTimelineItems(events)).toEqual([
  expect.objectContaining({
    kind: "goals",
    events: [events[0], events[2]],
    removeEventId: "g2",
  }),
  expect.objectContaining({ kind: "card", event: events[1] }),
]);
```

Adicionar casos separados para:

- mesmo `playerId` em equipas diferentes;
- ordem interna e `removeEventId` por índice original quando dois golos do grupo
  têm o mesmo `atSec`;
- ordem entre dois itens distintos com o mesmo `latestAtSec`, colocando primeiro
  o item cujo evento mais recente tem o maior índice original;
- `playerId === ""` agrupado por equipa;
- dois golos com o mesmo ID desconhecido agrupados, IDs desconhecidos diferentes
  separados e nenhum combinado com `playerId === ""`;
- chave do grupo sem colisões para vazio e IDs semelhantes a sentinelas, e chave
  de cartão exatamente igual ao `event.id`;
- ausência de mutação do array e dos objetos recebidos.

- [ ] **Step 2: Executar os testes e confirmar RED**

Run: `pnpm test src/components/timer/timeline-items.test.ts`

Expected: FAIL porque `./timeline-items` ou `buildTimelineItems` ainda não existe.

- [ ] **Step 3: Implementar os tipos e a transformação mínima**

Em `timeline-items.ts`, definir uma união discriminada:

```ts
export interface GoalTimelineItem {
  kind: "goals";
  key: string;
  team: TeamSide;
  playerId: string;
  events: ReadonlyArray<MatchEvent>;
  removeEventId: string;
  latestAtSec: number;
  latestIndex: number;
}

export interface CardTimelineItem {
  kind: "card";
  key: string;
  event: MatchEvent;
  removeEventId: string;
  latestAtSec: number;
  latestIndex: number;
}

export type TimelineItem = GoalTimelineItem | CardTimelineItem;
```

Implementar `buildTimelineItems(events)` sem ordenar ou modificar a entrada:

- percorrer `events` com o índice original;
- criar grupos de golo com chave collision-safe baseada no par, por exemplo
  `goals:${JSON.stringify([event.team, event.playerId])}`;
- criar um item independente para cada cartão;
- ordenar internamente os golos por `(atSec, índice original)` crescente;
- definir `removeEventId` com o último golo ordenado;
- ordenar os itens por `(latestAtSec, latestIndex)` decrescente.

- [ ] **Step 4: Executar os testes focados e confirmar GREEN**

Run: `pnpm test src/components/timer/timeline-items.test.ts`

Expected: todos os testes passam.

- [ ] **Step 5: Commit**

```bash
git add src/components/timer/timeline-items.ts src/components/timer/timeline-items.test.ts
git commit -m "feat(timer): group goal events by player"
```

### Task 2: Renderizar grupos de golos na cronologia

**Files:**
- Modify: `src/components/timer/event-timeline.tsx`
- Create: `src/components/timer/event-timeline.test.ts`

- [ ] **Step 1: Escrever o teste SSR de apresentação que falha**

Usar `React.createElement(EventTimeline, { match, onRemove })` e
`renderToStaticMarkup` de `react-dom/server` com um `Match` que tenha dois golos
do Rui e um cartão intercalado. O sufixo `.test.ts` é obrigatório porque a
configuração Vitest atual não recolhe `.test.tsx`. Confirmar no HTML:

- o nome `Rui` aparece uma vez na linha de golos;
- os dois tempos aparecem juntos e por ordem;
- o texto da assistência não aparece;
- existem apenas duas linhas/botões `aria-label="Remover lance"`: grupo e cartão;
- os nomes/fallbacks de jogador vazio e ID desconhecido continuam legíveis;
- equipa e ordem visual dos itens correspondem ao item mais recente;
- o botão mantém as classes de alvo tátil existentes.

O alvo exato do callback permanece provado pelo `removeEventId` no teste puro;
a interação final é confirmada no browser.

- [ ] **Step 2: Executar o teste e confirmar RED**

Run: `pnpm test src/components/timer/event-timeline.test.ts`

Expected: FAIL porque o componente atual renderiza uma linha por evento e mostra
a assistência.

- [ ] **Step 3: Integrar os itens no `EventTimeline`**

Substituir a ordenação direta de `match.events` por:

```ts
const items = buildTimelineItems(match.events);
```

Para `item.kind === "goals"`:

- resolver o nome com `playerId` e `team`;
- mostrar o ícone de golo uma vez;
- mostrar `item.events.map(event => formatMinute(event.atSec))`, unido por ` · `;
- não renderizar assistência;
- usar a equipa do grupo;
- chamar `onRemove(item.removeEventId)`.

Para `item.kind === "card"`, preservar a apresentação e remoção atuais.

Usar `item.key` como chave estável da animação. Manter classes Arena,
microinterações, `aria-label="Remover lance"` e o comportamento do empty state.

- [ ] **Step 4: Validar a integração**

Run:

```bash
pnpm test src/components/timer/timeline-items.test.ts src/components/timer/event-timeline.test.ts
pnpm test
pnpm ts-check
pnpm exec biome check src/components/timer/timeline-items.ts src/components/timer/timeline-items.test.ts src/components/timer/event-timeline.tsx src/components/timer/event-timeline.test.ts
git diff --check
```

Expected: 0 falhas e nenhum diagnóstico novo nos ficheiros alterados.

- [ ] **Step 5: Verificar manualmente no browser**

Executar `pnpm dev`, criar/abrir um jogo a partir de `/timer` e validar em
`/timer/jogo/[id]`. Registar dois golos do mesmo jogador com um cartão intercalado
e confirmar:

- uma só linha para o jogador;
- dois tempos na linha;
- cartão separado;
- assistências ausentes na linha agrupada;
- fallback legível para golo sem jogador e jogador removido/desconhecido;
- ordem das linhas pelo lance mais recente;
- `aria-label` e dimensão do alvo tátil preservados;
- primeiro clique em remover apaga apenas o tempo mais recente;
- segundo clique remove a linha quando não restarem golos.

- [ ] **Step 6: Commit**

```bash
git add src/components/timer/event-timeline.tsx src/components/timer/event-timeline.test.ts
git commit -m "feat(timer): render grouped goal times in timeline"
```
