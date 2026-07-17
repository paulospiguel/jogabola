# Timer / Gestor de Jogos & Treinos — Design

> Standalone, sem login. Cronómetro + gestão de partida (golos, assistências, cartões, partes) com muita animação (incl. 3D). Mobile-first. PT-PT.

**Data:** 2026-06-21
**Branch:** releases/jogabola-teams/release02
**Estado:** Aprovado para implementação

---

## 1. Objetivo

Tela independente dentro da app (`/timer`) que **não passa por login**, onde qualquer pessoa pode:

- Criar um **jogo** ou **treino** ad-hoc (Equipa A vs Equipa B, jogadores por nome).
- Correr um **cronómetro** em modo **cronológico** (conta para cima) ou **regressivo** (conta para baixo), com **partes/períodos**, **som + vibração** e **tempo extra (stoppage)**.
- Registar em direto **golos + assistências** e **cartões (amarelo/vermelho)** por jogador.
- Ver **resultado/resumo** no fim e **partilhar** (link + QR).

Tudo persistido em **localStorage** — zero backend, zero auth.

## 2. Decisões (locked)

| Tema | Decisão |
|---|---|
| Rota / storage | `/timer` no grupo `(public)`, layout standalone (sem chrome do website). localStorage + share link/QR. |
| Equipas | Ad-hoc rápido: nome Equipa A/B + jogadores por nome. Equipas guardadas reutilizáveis. |
| Eventos | Golos + assistências, cartões amarelo/vermelho, partes/períodos. (sem substituições) |
| Timer | Cronológico + regressivo + som/vibração + tempo extra (stoppage). |

## 3. Arquitetura

### Rotas
- `src/app/(public)/timer/layout.tsx` — shell standalone, `bg-arena-bg`, full-height mobile, sem header/footer do website. Herda fonts globais + i18n provider do root layout.
- `src/app/(public)/timer/page.tsx` — **Hub**: CTA "Novo jogo/treino", lista de jogos recentes, equipas guardadas.
- `src/app/(public)/timer/jogo/[id]/page.tsx` — **Live match** (ecrã principal).

### Modais / drawers (não páginas)
- **Setup** (drawer multi-step): tipo → equipas+jogadores → config do timer.
- **+Golo** (sheet): escolher marcador + assistência opcional.
- **+Cartão** (sheet): escolher jogador + cor.
- **Resumo/Partilha** (modal): resultado, marcadores, cartões, link + QR.

### Estado
- Hook `useMatchStore` (React `useReducer` + persistência localStorage). Auto-save em cada ação.
- Chaves: `jb_timer_matches` (lista de matches), `jb_timer_teams` (equipas guardadas), `jb_timer_active` (id ativo).
- **Timer resiliente a refresh**: guarda `startedAt` (timestamp) + `accumulatedSec`. `elapsed` recomputado no load = `accumulated + (now - startedAt)` quando `running`. Tick visual via `requestAnimationFrame`/interval de 250ms; fonte de verdade = timestamps.

### Módulo
Componentes em `src/components/timer/`. Reusa `BottomSheet`, `Cta`, `JbAvatar`, tokens `arena-*`. Strings PT-PT inline (módulo autónomo, não depende de dicionários next-intl).

## 4. Modelo de dados

```ts
type TeamSide = "A" | "B";
type CardColor = "yellow" | "red";

interface Player { id: string; name: string; }
interface Team   { name: string; color: string; players: Player[]; }

interface MatchConfig {
  mode: "up" | "down";       // cronológico | regressivo
  periodLenSec: number;       // duração de cada parte
  periods: number;            // nº de partes (1..n)
  sound: boolean;             // som + vibração no fim da parte / zero
}

interface MatchEvent {
  id: string;
  atSec: number;              // segundo da partida em que ocorreu
  period: number;
  type: "goal" | "card";
  team: TeamSide;
  playerId: string;
  assistId?: string;          // só goals
  card?: CardColor;           // só cards
}

interface MatchState {
  status: "idle" | "running" | "paused" | "ended";
  period: number;             // parte atual (1-based)
  accumulatedSec: number;     // tempo acumulado da parte atual quando pausado
  startedAt: number | null;   // timestamp ms do último start; null se pausado
  inStoppage: boolean;        // a contar tempo extra
}

interface Match {
  id: string;
  type: "jogo" | "treino";
  createdAt: number;
  teams: Record<TeamSide, Team>;
  config: MatchConfig;
  state: MatchState;
  events: MatchEvent[];
}
// score derivado de events (count type==="goal" por team)
```

## 5. Ecrãs e fluxo

1. **Hub** — header "JogaBola · Timer", CTA grande "Novo jogo/treino", secção "Recentes" (cards com resultado), "Equipas guardadas". Empty state com ícone+CTA. Stagger nas listas.
2. **Setup drawer** (3 passos):
   - Tipo: Jogo / Treino.
   - Equipas: nome A/B, cor, adicionar jogadores (input + enter). Pré-preencher de equipa guardada.
   - Timer: modo (cronológico/regressivo), duração da parte, nº de partes, som on/off. Botão "Começar" → cria match, navega `/timer/jogo/[id]`.
3. **Live match** (núcleo):
   - **TimerRing**: anel circular de progresso com **perspetiva/tilt 3D**, dígitos grandes (Sora), modo cima/baixo; stoppage em cor `warning`; pulse no último minuto.
   - **Scoreboard**: 2 equipas, golos com **flip 3D** do dígito ao marcar.
   - **Controls**: play/pause, reset (com confirmação), "Próxima parte" (auto half-time / som), **+Golo**, **+Cartão** por equipa.
   - **+Golo** → sheet marcador+assist; **+Cartão** → sheet jogador+cor.
   - **Timeline** de eventos (stagger, ícones por tipo).
   - Ao terminar última parte → estado `ended` → abre **Resumo**.
4. **Resumo/Partilha** — resultado final, lista de marcadores e cartões por equipa, botões: "Partilhar" (Web Share / copiar link com estado serializado em query/hash + QR), "Novo jogo", "Voltar ao hub".

## 6. Animações (3D, perf-aware)

framer-motion + CSS 3D transforms (sem libs novas — framer-motion, gsap, lottie já existem):

- TimerRing: `rotateX/rotateY` subtil em `perspective`, glow neon no progresso.
- Score: flip 3D do dígito (`rotateX`) ao incrementar.
- Eventos: card flip-in na timeline; burst de celebração no golo (lottie se asset adequado, senão CSS).
- Listas: stagger (`delay = i*30ms`).
- `.active:scale-[0.97]` (press) em todos os clicáveis.
- **Respeita `prefers-reduced-motion`**: desliga 3D/burst, mantém fades curtos.

## 7. Não-objetivos (YAGNI)

- Sem substituições, sem posições/números/táticas.
- Sem sincronização multi-dispositivo / tempo real.
- Sem persistência em DB nem ligação a equipas/eventos autenticados.
- Sem estatísticas históricas agregadas além do que está em localStorage.

## 8. Ficheiros (plano)

```
src/app/(public)/timer/layout.tsx
src/app/(public)/timer/page.tsx                 # Hub
src/app/(public)/timer/jogo/[id]/page.tsx       # Live (client)
src/components/timer/
  types.ts
  use-match-store.ts        # reducer + localStorage + timer ticking
  format.ts                 # mm:ss helpers
  timer-ring.tsx
  scoreboard.tsx
  match-controls.tsx
  event-timeline.tsx
  log-goal-sheet.tsx
  log-card-sheet.tsx
  setup-drawer.tsx
  summary-modal.tsx
  hub-view.tsx
  team-color.ts             # paleta de cores das equipas
```

## 9. Critérios de sucesso

- Abrir `/timer` sem login funciona; refresh durante jogo mantém tempo e eventos.
- Cronológico e regressivo corretos; stoppage conta após zero; som+vibração no fim da parte.
- Registar golo/assistência/cartão atualiza placar e timeline em direto.
- Resumo mostra resultado correto e link partilhável reabre o resultado.
- Mobile-first fluido; animações não bloqueiam a marcação; `prefers-reduced-motion` respeitado.
- `pnpm lint` + `ts-check` limpos.
