# Mini-torneio recreativo (módulo do /timer) — Design

> **Nome do módulo e slug do URL: por definir pelo utilizador.** Neste documento uso "torneio" como termo técnico descritivo (palavra do próprio utilizador), não como nome de marca. Antes da implementação, o utilizador define o nome visível e o slug de rota; os identificadores de código podem ficar sob um namespace neutro `tournament`.

**Data:** 2026-07-14
**Estado:** Aprovado (brainstorming) — pronto para writing-plans
**Âmbito:** Extensão do `/timer` público (sem login, localStorage), reutilizando o motor de partida existente.

## Problema

Em treino recreativo com campo alugado montam-se 3-4 (até 6) equipas que jogam partidas curtas entre si durante 1-2h. Falta uma forma de: montar as equipas, correr partidas em série no formato "vencedor fica", registar golos por jogador, e no fim saber a **equipa campeã** (por pontos) e o **artilheiro do evento**. O cronómetro atual só gere uma partida isolada de 2 equipas.

## Objetivos

- Montar 3-6 equipas (nome, cor, plantel opcional) num setup rápido.
- Formato "vencedor fica" configurável.
- Correr cada partida reutilizando a *live match view* existente (cronómetro, golos, cartões, fim confirmado).
- Empates resolvidos no campo; a app só regista quem ganhou a decisão.
- Classificação por pontos com desempates; artilheiro do evento por jogador.
- Persistência local **estruturada para migrar a Postgres/Drizzle** sem reescrever ecrãs.
- Resultado final partilhável por URL com OG dinâmico (padrão do cronómetro).

## Não-objetivos (YAGNI)

- Sem login/backend nesta fase (mas arquitetura pronta para o passo seguinte).
- Sem chaves eliminatórias/playoffs — só liga informal "vencedor fica".
- Sem estender o `Match` de 2 equipas para N equipas.
- Golos da decisão (penáltis/par-ímpar) não são registados nem contam para artilheiro.

## Arquitetura

Camada orquestradora ("meta-jogo") por cima do motor de partida atual. O torneio é dono das equipas e do histórico de partidas; cada jogo individual continua a ser um `Match` de 2 equipas jogado na `MatchView`. O torneio agrega pontos/saldo/artilheiro (funções puras) e decide o próximo par (motor vencedor-fica puro). Persistência atrás de um `TournamentRepository` assíncrono, com implementação localStorage agora e Server Actions depois.

## Modelo de dados

```ts
interface TournamentTeam {
  id: string;               // crypto.randomUUID()
  name: string;
  color: string;
  players: Player[];        // persiste entre jogos; cresce com "adicionar" inline
}

type WinnerStaysMode = "always" | "maxTwoInARow";

interface TournamentConfig {
  mode: WinnerStaysMode;
  matchLenSec: number;      // tempo por partida
  timerMode: "down" | "up"; // default "down" (regressivo)
  sound: boolean;
  // pontos fixos: vitória=3, empate=1, bónus decisão=+1
}

type MatchOutcome = "regA" | "regB" | "decisionA" | "decisionB";

interface TournamentMatch {
  id: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;           // golos do tempo normal
  scoreB: number;
  outcome: MatchOutcome;    // quem ganhou e como
  decisionMethod?: "coin" | "penalties"; // nota opcional; só quando outcome = decision*
  goals: Array<{ playerId: string; teamId: string; atSec: number }>; // tempo normal, p/ artilheiro
  endedAt: number;
}

type TournamentStatus = "setup" | "running" | "ended";

interface Tournament {
  id: string;
  name?: string;            // nome opcional do evento
  createdAt: number;
  teams: TournamentTeam[];  // 3 a 6
  config: TournamentConfig;
  matches: TournamentMatch[];   // histórico append-only
  queue: string[];              // IDs em espera; front = próximo desafiante
  currentPair: [string, string] | null; // par em campo (ou a iniciar)
  status: TournamentStatus;
}
```

`Player` reutiliza o tipo existente de `src/components/timer/types.ts`.

## Pontos (derivados, não guardados)

Por partida:

| Outcome | Equipa A | Equipa B |
|---|---|---|
| `regA` | +3 | +0 |
| `regB` | +0 | +3 |
| `decisionA` | +2 (empate 1 + bónus 1) | +1 |
| `decisionB` | +1 | +2 (empate 1 + bónus 1) |

## Classificação (função pura `computeStandings`)

Por equipa agrega: `points, played, wins, gf, ga, gd` (golos só do tempo normal).
Ordenação: **pontos → saldo de golos → golos marcados → confronto direto**. Se ainda empatar, ordem estável por nome.

## Artilheiro (função pura `computeTopScorers`)

Agrega golos do tempo normal por `playerId` em todas as partidas. Ordem: **golos → menos jogos disputados → nome**. Empate de artilheiros mostra todos os empatados.

## Motor vencedor-fica (função pura)

Assinatura conceptual:

```ts
resolveNext(input: {
  finished: TournamentMatch;
  queue: string[];
  mode: WinnerStaysMode;
  matches: TournamentMatch[]; // histórico, p/ derivar streak
}): { currentPair: [string, string]; queue: string[] };
```

Seja `winner`/`loser` do `finished` (no empate, o vencedor é o da decisão).

**Modo `always`:**
- `challenger = queue.shift()` (frente)
- `currentPair = [winner, challenger]`
- `queue.push(loser)`

**Modo `maxTwoInARow`:**
- `streak(winner)` = nº de partidas mais recentes seguidas ganhas por `winner` sem interrupção.
- Se esta vitória fez `streak == 2` → **winner descansa**: `queue.push(loser); queue.push(winner); currentPair = [queue.shift(), queue.shift()]`. O contador reinicia naturalmente (winner saiu de campo).
- Caso contrário → como no modo `always`.

**Inicialização (fim do setup):** `queue` = ordem das equipas (ou baralhada por sorteio); `currentPair = [queue.shift(), queue.shift()]`; `status = "running"`.

**Restrições:** mínimo 3 equipas (garante ≥1 em espera). 2 equipas → usar o cronómetro normal.

## Empate — folha de decisão

Ao terminar uma partida com `scoreA == scoreB`, abre uma folha: "Empate — quem ganhou a decisão?" com as 2 equipas + método opcional (`coin` par/ímpar · `penalties`) apenas como nota. Toque na equipa vencedora → `outcome = decisionA|B`. Golos da decisão não são registados.

## Ligação ao motor de partida existente

Ao iniciar `currentPair`:
`createMatch("jogo", teamA, teamB, { mode: config.timerMode, periodLenSec: config.matchLenSec, periods: 1, sound: config.sound })` → jogar na `MatchView`.

No fim (`endMatch`): extrair do `Match` os `events` do tipo `goal` (tempo normal) → mapear para `TournamentMatch.goals` (já têm `playerId`; `teamId` resolvido pelo lado A/B). Determinar `outcome`; se empate, via folha de decisão. Persistir a partida, correr `resolveNext`, voltar à vista do torneio.

Jogadores adicionados inline durante a partida propagam para o `TournamentTeam.players` correspondente (ficam disponíveis nos jogos seguintes).

## Fluxo de ecrãs

1. **Hub** — ponto de entrada no espaço do timer: torneios guardados + "novo torneio".
2. **Setup** — equipas (3-6): nome/cor/jogadores; config (modo, tempo/partida, som); sorteios opcionais.
3. **Vista do torneio** — par atual (A vs B), fila de espera, mini-tabela ao vivo, "Iniciar partida". Regressa aqui após cada jogo com tabela atualizada + próximo par.
4. **Partida ao vivo** — `MatchView` reutilizada (1 período).
5. **Fim** — "Terminar torneio" → campeão + tabela final + artilheiro; partilhável.

## Sorteio (opcional, no setup)

- **Nomes**: distribui uma lista de nomes aleatoriamente pelas equipas.
- **Quem começa**: baralha a `queue` inicial → define 1.º par + ordem de espera.
- Puros e testáveis (RNG injetável para testes determinísticos).

## Persistência — pronta para DB

- Domínio agnóstico de storage. Leituras/escritas só via `tournament-repository.ts`.
- Interface **assíncrona desde já** (`Promise`), com localStorage por baixo (`Promise.resolve`). Migração para Postgres = trocar o corpo por **Server Actions** (regra "Server Actions First"), sem tocar nos ecrãs.
- IDs por `crypto.randomUUID()` (prontos a PK, sem colisão ao sincronizar).

```ts
interface TournamentRepository {
  list(): Promise<Tournament[]>;
  get(id: string): Promise<Tournament | null>;
  save(t: Tournament): Promise<void>;
  remove(id: string): Promise<void>;
}
// agora: LocalStorageTournamentRepository · depois: ServerActionTournamentRepository
```

### Esquema-alvo Drizzle (desenhado agora, criado na migração)

Mapeamento 1-para-1 do modelo normalizado:

- `tournaments` (id PK, name, created_at, status, config JSON ou colunas, queue JSON, current_pair JSON)
- `tournament_teams` (id PK, tournament_id FK, name, color)
- `tournament_players` (id PK, team_id FK, name)
- `tournament_matches` (id PK, tournament_id FK, team_a_id FK, team_b_id FK, score_a, score_b, outcome, decision_method, ended_at)
- `tournament_goals` (id PK, match_id FK, player_id FK, team_id FK, at_sec)

Os refs `teamAId`/`playerId` do modelo TS já são FKs — nenhuma remodelação necessária.

## Branding / identidade visual

Reforçar a marca reutilizando o componente `Logo` (`src/components/logo.tsx`) — logotipo real em vez de só ícone+texto:

- **Header dos ecrãs do torneio** (hub, setup, vista do torneio): `Logo variant="white" size="header"`.
- **Página de resultado partilhado** (superfície viral, vista pelo recetor): `Logo variant="white"` em destaque no topo, com `href="/"` para levar o recetor ao site (reforça marca + funil de aquisição).
- **Ecrã de campeão/final**: `Logo` + asset `trophy.svg` (`src/assets/images/trophy.svg`) na celebração do vencedor.

Assets: `@/assets/logos/jogabola-white.svg` (via componente `Logo`), `@/assets/images/trophy.svg`. O logotipo branco assenta no fundo escuro `bg-arena-bg` (tokens Arena mantidos).

Nota técnica: `Logo` é `"use client"` e usa `useSession`/`useRouterUtils`. Nos ecrãs standalone do timer, usar sem lógica de redirect dependente de sessão (`href="/"` simples ou sem `href` para logo estático) — evita acoplamento à sessão autenticada.

## Partilha

Resultado final (campeão + tabela + artilheiro) codificado no URL reutilizando o padrão base64url de `share.ts` → página pública de resultado do torneio com `generateMetadata` (OG dinâmico), como no cronómetro. O topo da página usa o `Logo` (ver Branding).

## Estrutura de ficheiros

**Reutiliza:** `createMatch`, `MatchView`, `LogGoalSheet`, `EventTimeline`, `Scoreboard`, `team-color.ts`, `format.ts`, padrão de `share.ts`, `BottomSheet`, `Cta`, componente `Logo` (`src/components/logo.tsx`), asset `trophy.svg`, tokens Arena.

**Novo (namespace `tournament`, sob o espaço do timer):**
- `types.ts` — tipos acima.
- `tournament-repository.ts` — interface + impl localStorage (async).
- `standings.ts` — `computeStandings`, `computeTopScorers` (puras).
- `engine.ts` — `resolveNext`, `initQueue`, `pointsFor` (puras).
- `draw.ts` — sorteios (RNG injetável).
- `tournament-share.ts` — encode/decode + OG helpers do resultado.
- Ecrãs: hub, setup, vista do torneio, folha de decisão, vista final/tabela.
- Rotas sob o slug a definir + página de resultado partilhado.

## Testes (vitest node)

- `standings`: pontos por outcome, agregação, ordem de desempate (saldo → golos → confronto direto).
- `topScorers`: agregação por jogador, empates, ordem.
- `engine`: `resolveNext` nos 2 modos; transições de fila com 3 e 4-6 equipas; regra "máx 2 seguidos" (descanso + reset).
- `draw`: distribuição de nomes e baralho de fila com RNG determinística.
- `tournament-share`: round-trip encode/decode + OG helpers.

## Itens em aberto (a fechar no plano/implementação)

- **Nome do módulo + slug de rota** — decisão do utilizador.
- Ícones/entrada visual no hub do timer.
- Config expõe `timerMode`? (default `down`; talvez não expor na v1).
