# Etapa 2 — contrato backend de clubes e calendário competitivo

Contrato entre o backend da etapa 2 ([ADR 0004](../adr/0004-competitive-calendar.md), [ADR 0005](../adr/0005-club-calendar-authorization.md)) e a interface. Não há páginas nesta entrega; a UI consome apenas as Server Actions abaixo.

## Regras gerais

- Todas as ações exigem sessão. A identidade vem sempre da sessão: campos como `userId`, `clubId` (em `createFixture`) ou `createdBy` enviados pelo cliente são descartados pelo Zod.
- Resultado: `ActionResult<T>` de `src/types/common.ts`.
  - Sucesso: `{ success: true, data: T }`.
  - Erro: `{ success: false, error: { code } }`. Em validação, `{ code: "VALIDATION_ERROR", fieldErrors: { campo: ["VALIDATION_…"] } }`.
- Mensagens: `arenaClubCalendar.errors.<code>` para `error.code` e `validation.<VALIDATION_…>` para cada entrada de `fieldErrors`.
- IDs são inteiros positivos. `startsAt` é um instante ISO 8601 **com fuso explícito** (`2026-12-06T15:00:00Z` ou `+00:00`); a resposta devolve sempre UTC (`toISOString()`). A UI converte para o fuso do calendário.
- Datas de época (`startsOn`, `endsOn`) são `YYYY-MM-DD` ou `null`.
- As ações não fazem `revalidatePath` (ainda não existem rotas). A UI deve voltar a pedir os dados após uma mutação.
- `canManage` e `role` servem apenas para decidir o que mostrar. A autorização é sempre repetida no servidor.

## Quem pode fazer o quê

| Ação | Condição verificada no servidor |
| --- | --- |
| Ler épocas, adversários, lista de jogos do clube | Membro do clube (`admin` ou `member`). |
| Ler um jogo | Membro do clube **e** vínculo à equipa do jogo (`teams.owner_id`, linha em `team_members` ou linha em `team_staff`). |
| Criar jogo, associar/desassociar convocatória | Membro do clube **e** proprietário registado da equipa (`teams.owner_id`). Membros de staff (`team_staff`, que só leem) e o papel `owner` no plantel não chegam. |
| Gerir épocas e adversários | Administrador do clube. |
| Criar clube com equipa | Proprietário da equipa; a equipa tem de estar livre. Quem cria fica `admin`. |
| Associar equipa a clube | Administrador do clube de destino **e** proprietário da equipa; equipa livre. |

## Ações — `src/actions/clubs.actions.ts`

| Ação | Entrada | `data` em caso de sucesso | Erros de domínio |
| --- | --- | --- | --- |
| `createClubWithTeam` | `{ name: string(2–80), teamId }` | `{ club: { id, name }, teamId, season: SeasonDto }` | `TEAM_NOT_FOUND`, `FORBIDDEN`, `TEAM_ALREADY_IN_CLUB` |
| `attachTeamToClub` | `{ clubId, teamId }` | `{ clubId, teamId }` | `CLUB_NOT_FOUND`, `FORBIDDEN`, `TEAM_NOT_FOUND`, `TEAM_ALREADY_IN_CLUB` |
| `listMyClubs` | nenhuma | `ClubSummary[]` | — |
| `listAttachableTeams` | nenhuma | `{ id, name }[]` (equipas próprias sem clube) | — |
| `listClubSeasons` | `{ clubId }` | `(SeasonDto & { fixtureCount })[]` (mais recente primeiro) | `CLUB_NOT_FOUND` |
| `createSeason` | `{ clubId, name, startsOn?, endsOn? }` | `SeasonDto` | `CLUB_NOT_FOUND`, `FORBIDDEN`, `SEASON_NAME_TAKEN` |
| `updateSeason` | `{ seasonId, name, startsOn?, endsOn? }` | `SeasonDto` | `SEASON_NOT_FOUND`, `FORBIDDEN`, `SEASON_NAME_TAKEN` |
| `deleteSeason` | `{ seasonId }` | `{ id }` | `SEASON_NOT_FOUND`, `FORBIDDEN`, `SEASON_IN_USE` |
| `listClubOpponents` | `{ clubId }` | `(OpponentDto & { fixtureCount })[]` (por nome) | `CLUB_NOT_FOUND` |
| `createOpponent` | `{ clubId, name }` | `OpponentDto` | `CLUB_NOT_FOUND`, `FORBIDDEN`, `OPPONENT_NAME_TAKEN` |
| `updateOpponent` | `{ opponentId, name }` | `OpponentDto` | `OPPONENT_NOT_FOUND`, `FORBIDDEN`, `OPPONENT_NAME_TAKEN` |
| `deleteOpponent` | `{ opponentId }` | `{ id }` | `OPPONENT_NOT_FOUND`, `FORBIDDEN`, `OPPONENT_IN_USE` |

`createClubWithTeam` abre na mesma transação a época de futebol em curso (julho a junho, no fuso `Europe/Lisbon`), por exemplo `2026/27` de `2026-07-01` a `2027-06-30`, para o capitão poder marcar o primeiro jogo sem passar pelas definições.

`fixtureCount` é o número de jogos que usam a época ou o adversário, só para administradores do clube (para membros é `null`, porque a pertença ao clube não dá acesso aos jogos de outras equipas). A UI usa-o para desativar "Remover"; o servidor mantém o `RESTRICT`.

`updateSeason` substitui `startsOn`/`endsOn`: omitir um campo grava `null`.

Os nomes de épocas e de adversários são únicos por clube sem distinguir maiúsculas de minúsculas (índices únicos em `(club_id, lower(name))`): "Sub-19" e "sub-19" devolvem `*_NAME_TAKEN`.

## Ações — `src/actions/fixtures.actions.ts`

| Ação | Entrada | `data` | Erros de domínio |
| --- | --- | --- | --- |
| `createFixture` | `{ teamId, seasonId, opponentId, competitionName: string(2–80), startsAt, matchSessionId? }` | `FixtureDto` | `TEAM_NOT_FOUND`, `FORBIDDEN`, `TEAM_NOT_IN_CLUB`, `SEASON_NOT_FOUND`, `OPPONENT_NOT_FOUND`, `MATCH_SESSION_NOT_FOUND`, `MATCH_SESSION_ALREADY_LINKED` |
| `linkMatchSession` | `{ fixtureId, matchSessionId }` | `FixtureDto` | `FIXTURE_NOT_FOUND`, `FORBIDDEN`, `MATCH_SESSION_NOT_FOUND`, `FIXTURE_ALREADY_LINKED`, `MATCH_SESSION_ALREADY_LINKED` |
| `unlinkMatchSession` | `{ fixtureId }` | `FixtureDto` (com `linkedMatchSessionId: null`) | `FIXTURE_NOT_FOUND`, `FORBIDDEN` |
| `listClubFixtures` | `{ clubId, seasonId?, teamId?, from?, to? }` | `FixtureDto[]` por `startsAt` | `CLUB_NOT_FOUND` |
| `getFixture` | `{ fixtureId }` | `FixtureDto` | `FIXTURE_NOT_FOUND` |

- `createFixture` deriva o clube da equipa. Com `matchSessionId`, o jogo e a ligação são criados na mesma transação: se a ligação for recusada, não fica jogo.
- A convocatória tem de ser da mesma equipa do jogo. Uma convocatória de outra equipa devolve `MATCH_SESSION_NOT_FOUND`, igual a um ID inexistente.
- `getFixture` devolve `FIXTURE_NOT_FOUND` tanto para IDs inexistentes como para jogos fora do âmbito. `listClubFixtures` devolve só os jogos das equipas a que o utilizador está vinculado; um membro sem equipas no clube recebe `[]`.
- `from`/`to` são instantes ISO com fuso; filtram `startsAt` de forma inclusiva.
- Apagar uma convocatória (fluxo atual) remove a ligação e mantém o jogo.

## Tipos devolvidos (`src/db/queries/club-calendar.ts`)

```ts
interface ClubSummary {
  id: number;
  name: string;
  role: "admin" | "member";
  ownedTeams: { id: number; name: string }[]; // equipas do clube cujo proprietário é o utilizador
}

interface SeasonDto { id: number; clubId: number; name: string; startsOn: string | null; endsOn: string | null }
interface OpponentDto { id: number; clubId: number; name: string }

interface FixtureDto {
  id: number;
  clubId: number;
  team: { id: number; name: string };
  season: { id: number; name: string };
  opponent: { id: number; name: string };
  competitionName: string;
  startsAt: string;                  // ISO 8601 UTC
  linkedMatchSessionId: number | null;
  canManage: boolean;                // só para apresentação: é o proprietário da equipa
}
```

O `FixtureDto` não inclui dados da convocatória (local, reservas, pagamentos). Para os mostrar, a UI usa `linkedMatchSessionId` com as ações de convocatórias existentes, que mantêm as suas regras de acesso. As respostas de convocatórias e das páginas de convidado não incluem dados competitivos.

## Chaves i18n

Disponíveis em `pt.json`, `en.json`, `es.json` e `fr.json`:

- `arenaClubCalendar.roles.admin`, `arenaClubCalendar.roles.member`.
- `arenaClubCalendar.errors.*`: `UNAUTHORIZED`, `VALIDATION_ERROR`, `CLUB_NOT_FOUND`, `FORBIDDEN`, `TEAM_NOT_FOUND`, `TEAM_NOT_IN_CLUB`, `TEAM_ALREADY_IN_CLUB`, `SEASON_NOT_FOUND`, `SEASON_NAME_TAKEN`, `SEASON_IN_USE`, `OPPONENT_NOT_FOUND`, `OPPONENT_NAME_TAKEN`, `OPPONENT_IN_USE`, `FIXTURE_NOT_FOUND`, `MATCH_SESSION_NOT_FOUND`, `FIXTURE_ALREADY_LINKED`, `MATCH_SESSION_ALREADY_LINKED`, `UNKNOWN_ERROR`.
- `validation.*` (novas): `VALIDATION_CLUB_REQUIRED`, `VALIDATION_SEASON_REQUIRED`, `VALIDATION_OPPONENT_REQUIRED`, `VALIDATION_FIXTURE_REQUIRED`, `VALIDATION_CLUB_CALENDAR_NAME_TOO_SHORT`, `VALIDATION_CLUB_CALENDAR_NAME_TOO_LONG`, `VALIDATION_DATE_INVALID`, `VALIDATION_SEASON_RANGE_INVALID`, `VALIDATION_DATE_RANGE_INVALID`. Reutilizadas: `VALIDATION_TEAM_REQUIRED`, `VALIDATION_MATCH_SESSION_REQUIRED`, `VALIDATION_STARTS_AT_INVALID`.

Os textos de ecrã (títulos, botões, estados vazios) ficam a cargo da frente de UI, no mesmo namespace `arenaClubCalendar`, nas quatro línguas.

## Interface (frente UI)

Rotas autenticadas na Arena, atrás de `FEATURES.clubCalendar`:

| Rota | Conteúdo |
| --- | --- |
| `/arena/club` | Escolhe o clube da equipa ativa; sem clube, estado vazio com "Criar clube" para o proprietário. |
| `/arena/club/[clubId]` | Calendário: próximos/anteriores, filtros de época e equipa, agrupado por dia em `Europe/Lisbon`. |
| `/arena/club/[clubId]/fixtures/new` | Novo jogo, com convocatória opcional da mesma equipa. |
| `/arena/club/[clubId]/fixtures/[fixtureId]` | Detalhe, associar/desassociar convocatória, ligação à convocatória. |
| `/arena/club/[clubId]/settings` | Épocas e adversários; escrita só para administradores, `*_IN_USE` mostrado como "Em uso". |

O layout do clube valida a pertença com `listMyClubs` no servidor; um clube desconhecido ou alheio mostra o mesmo "Clube não encontrado". Como as ações não fazem `revalidatePath`, a UI invalida as queries TanStack após cada mutação e faz `router.refresh()` depois de criar o clube. O clube ainda não tem fuso próprio: a UI usa `Europe/Lisbon` para ler e gravar horas.

## Fora deste contrato

- Editar ou apagar jogos, desassociar equipas de clubes, convites e gestão de membros do clube, transferência de administração. No piloto, os membros adicionais são criados com dados sintéticos (ADR 0005).
- Staff virtual: permissões definidas no ADR da etapa 3.
