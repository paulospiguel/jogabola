# 6. Staff da equipa, Plantel e transferência de propriedade

Data: 2026-11-26

## Estado

Aceite. Desenho de referência: `docs/superpowers/specs/2026-11-26-team-staff-and-roster-design.md`.

## Contexto

Hoje `team_members` mistura gestão e Plantel. O papel `owner` marca quem criou a equipa, `manager` marca o co-capitão e `player` marca o atleta. Quem cria uma equipa entra automaticamente como atleta e o co-capitão é o único nível intermédio de gestão. Gerir não implica jogar.

No rumo AI Club OS, uma equipa pode ter só o dono, o dono e mais uma pessoa, ou uma equipa técnica completa (treinador, financeiro, diretor). O dono tem de controlar quem gere, o que cada pessoa pode alterar e a quem passa a equipa.

Existem falhas de autorização nas entradas de escrita do Plantel e dos pagamentos. `addTeamMember` não exige autenticação nem autorização. `addPlayerToRoster` e `upsertTeamPaymentSettings` só exigem acesso à equipa, por isso qualquer atleta as executa. O ADR 0005 exige proteger as escritas em `team_members` antes de ligar a leitura competitiva à aplicação.

## Decisão

### Papéis

| Papel | Fonte de verdade | Pode |
| --- | --- | --- |
| Dono | `teams.owner_id` (único) | Tudo. É staff implícito e não tem linha em `team_staff`. |
| Membro de staff | `team_staff` | Ver tudo da equipa. Alterar só o que os seus privilégios permitem. |
| Atleta | `team_members` (só Plantel) | O que um atleta pode hoje: presenças próprias, comprovativos, chat. |

Uma pessoa pode ser atleta e staff ao mesmo tempo. O dono pode ser atleta ou não. Ver a equipa exige ser dono, staff ou atleta. Quem cria uma equipa é dono e não fica atleta automaticamente; pode optar por entrar no Plantel. O mesmo vale para a equipa criada automaticamente em `match-sessions.actions.ts`. O co-capitão desaparece dos dados e da UI e passa a membro de staff.

### Catálogo de privilégios

A constante `STAFF_PERMISSIONS` define o catálogo:

| Chave | Cobre |
| --- | --- |
| `events.manage` | Criar, editar e cancelar convocatórias; recorrências |
| `attendance.manage` | Confirmar ou alterar presenças de atletas; lista de espera |
| `roster.manage` | Adicionar e remover atletas do Plantel; enviar email a um atleta |
| `payments.manage` | Racha, validação de comprovativos, multas, definições de pagamento da equipa |
| `communication.manage` | Mural de avisos e comunicações dirigidas ao Plantel |
| `match.manage` | Relatório de jogo, estatísticas e balanceamento de equipas |

Ficam reservados ao dono, sem interruptor: gerir staff e privilégios, transferir a equipa, apagar a equipa, faturação e plano, e as ações competitivas do ADR 0005.

Os cargos são rótulos e sugestões, sem poder próprio: `coach`, `director`, `finance`, `secretary` e `other`. Ao escolher o cargo, os privilégios vêm pré-preenchidos e o dono ajusta:

| Cargo | Privilégios sugeridos |
| --- | --- |
| `coach` | `events.manage`, `attendance.manage`, `match.manage` |
| `director` | Todos |
| `finance` | `payments.manage` |
| `secretary` | `events.manage`, `attendance.manage`, `communication.manage` |
| `other` | Nenhum |

### Dados

- `team_staff`: `id`, `team_id` (FK, cascade), `user_id` (FK, cascade), `title`, `permissions text[] not null default '{}'`, `created_by`, `created_at`, `updated_at`. Único `(team_id, user_id)`. Uma constraint garante `permissions <@ ARRAY[...catálogo]`. O dono nunca tem linha.
- `team_members` passa a significar só Plantel. A coluna `role` perde o significado de gestão e fica normalizada para `player`. A remoção da coluna fica para depois, para não partir leituras.
- `team_staff_events`: registo só de inserções com `id`, `team_id`, `actor_user_id`, `subject_user_id`, `type`, `payload jsonb` e `created_at`. Tipos: `promoted`, `demoted`, `permissions_changed`, `title_changed`, `ownership_transfer_requested`, `ownership_transfer_cancelled`, `ownership_transfer_accepted`, `ownership_transfer_expired`, `athlete_opt_in`, `athlete_opt_out`.
- `team_ownership_transfers`: `id`, `team_id`, `from_user_id`, `to_user_id` (nullable), `to_email` (normalizado), `token_hash`, `status` (`pending`, `accepted`, `cancelled`, `expired`), `expires_at` (criação + 7 dias), `created_at` e `resolved_at`. Um índice parcial único permite um só pedido `pending` por equipa.

Rejeitámos uma linha por privilégio, por exigir mais escritas e leituras para seis privilégios, e uma coluna booleana por privilégio, por obrigar a uma migração a cada privilégio novo. Rejeitámos também uma coluna `is_athlete` em `team_members`, por manter a mistura entre gestão e Plantel.

### Migração

A migração é idempotente:

1. Cria as tabelas e as constraints.
2. Cada `team_members.role = 'manager'` gera uma linha em `team_staff` com `title = 'other'` e os privilégios `events.manage`, `attendance.manage`, `payments.manage`, `communication.manage` e `roster.manage`. São os que o co-capitão exerce hoje, por isso nada se perde.
3. As linhas com `role = 'owner'` permanecem no Plantel. Os donos existentes continuam atletas.
4. Normaliza `role` de `owner` e `manager` para `player`, depois da cópia.

### Autorização no servidor

O módulo `src/lib/team-authz.ts` substitui `team-access.ts` e `team-capabilities.ts`. `getTeamAccess` devolve numa só consulta se o utilizador é dono, se é atleta e o seu staff (cargo e privilégios). `can(userId, teamId, permission)` devolve verdadeiro para o dono e para o staff com essa permissão. `requireOwner` protege as ações reservadas ao dono.

As mutações verificam a permissão na operação de escrita. Nas operações por identificador, o `teamId` vem do registo persistido, nunca do cliente. A permissão vista no cliente é só apresentação.

| Ponto de código | Passa a exigir |
| --- | --- |
| `match-sessions.actions.ts` | `events.manage` |
| `attendance.actions.ts` | `attendance.manage` |
| `notices.actions.ts` | `communication.manage` |
| `payment-lifecycle`, `payment-proofs`, `payment-verification`, `payments.actions.ts`, `lib/fines.ts` | `payments.manage` |
| `team-balancer.actions.ts`, relatório e estatísticas | `match.manage` |
| `removePlayerFromRoster`, `addPlayerToRoster`, `sendRosterPlayerEmail` | `roster.manage` |
| `setCoCaptain` | Removida; dá lugar às ações de staff |

Correções nesta entrega: `addTeamMember` deixa de ser Server Action exportada ou passa a exigir `roster.manage`; `addPlayerToRoster` passa a exigir `roster.manage`; `upsertTeamPaymentSettings` passa a exigir `payments.manage`. Estas correções cumprem o pré-requisito do ADR 0005 de proteger as escritas em `team_members` contra utilizadores sem autorização de gestão.

Regras do Plantel face ao staff:

- Quem tem `roster.manage` remove atletas comuns, mas não remove do Plantel o dono nem um membro de staff. Só o dono remove um membro de staff do Plantel. Cada pessoa pode sempre sair do Plantel com `setMyAthleteStatus`.
- Sair ou ser removido do Plantel não despromove. O staff mantém-se até o dono o despromover.
- O staff vem do Plantel: só um atleta registado pode ser promovido. Convidar alguém de fora diretamente para staff fica fora desta decisão.

Leituras e notificações hoje presas a `teams.owner_id`:

- As notificações de comprovativos vão para o dono e para o staff com `payments.manage`.
- O chat de evento abre ao dono, ao staff com `events.manage` e aos atletas confirmados.
- O botão de editar evento aparece a quem tem `events.manage`.

### Ações

- `setMyAthleteStatus`: o próprio utilizador entra ou sai do Plantel. Sair não apaga presenças, pagamentos nem estatísticas históricas.
- `promoteToStaff`, `updateStaffMember` e `demoteStaff`: só o dono. Despromover remove a linha de `team_staff` e mantém o lugar no Plantel.
- `requestOwnershipTransfer`: só o dono, para um membro ou para um email. Exige escrever o nome da equipa. Envia email com link de token e notificação na app se o destinatário tiver conta.
- `cancelOwnershipTransfer`: só o dono.
- `declineOwnershipTransfer`: o destinatário recusa.
- `acceptOwnershipTransfer`: o utilizador autenticado tem de corresponder a `to_user_id` ou a `to_email` verificado.

O aceite corre numa transação com bloqueio da linha do pedido:

1. Verifica que o pedido está `pending` e não expirou.
2. Se o destinatário já atingiu o limite de equipas do seu plano (`canCreateTeam` sobre as equipas de que é dono), recusa com `TEAM_LIMIT_REACHED` e uma mensagem de upgrade. O pedido continua `pending` até expirar.
3. Atribui `teams.owner_id` ao destinatário e remove a linha dele em `team_staff`, se existir.
4. O dono antigo não fica no staff. Mantém a linha em `team_members` só se já era atleta.
5. Desliga `stripeEnabled`, `mbwayEnabled` e `transferEnabled` em `team_payment_settings`. Os dados ficam guardados mas inativos até o novo dono os reconfigurar. `cashEnabled` mantém-se. Os comprovativos pendentes passam a notificar o novo dono e o staff com `payments.manage`.
6. Marca o pedido como `accepted` e regista o evento.

Repetir o aceite é idempotente. A expiração é verificada na leitura e no aceite (`expires_at < now` passa a `expired`), sem worker. A transferência não altera o vínculo da equipa a um clube nem transfere a propriedade do clube.

Todas as ações registam em `team_staff_events` e fazem `revalidatePath("/arena", "layout")`.

## Consequências

A gestão deixa de depender de jogar. O dono controla a equipa por `teams.owner_id` e não perde o acesso por não ser atleta. Os donos e co-capitães existentes mantêm o lugar no Plantel, as presenças, as estatísticas, os pagamentos e as multas.

Um privilégio novo entra no catálogo e na constraint, sem coluna nova. O mesmo modelo deve permitir encaixar o staff virtual mais tarde. As permissões do Secretário ficam para o ADR da etapa 3 do AI Club OS.

A transferência deixa a equipa sempre com um único dono. O novo dono tem de reconfigurar MB WAY, transferência e Stripe antes de voltar a receber por esses métodos. Os utilizadores `players` sem conta continuam separados do Plantel registado.

A coluna `team_members.role` fica na tabela sem significado de gestão até uma limpeza posterior. A delegação de ações competitivas do ADR 0005 a membros de staff continua fora deste ADR.

## Verificação

- `can()` devolve o resultado certo para dono, staff com e sem a permissão, atleta e estranho.
- A migração cria staff `other` com os cinco privilégios para cada `manager` e mantém cada `owner` no Plantel. Repetir a migração não duplica linhas. Validar com `scripts/test-db-migrations.mjs` e `pnpm db:local-setup`.
- Um atleta sem privilégio recebe `FORBIDDEN` em `addPlayerToRoster`, `upsertTeamPaymentSettings` e na antiga `addTeamMember`.
- Cada ação nova verifica autorização, alvo e idempotência.
- Quem tem `roster.manage` não remove do Plantel o dono nem um membro de staff.
- A transferência recusa pedidos expirados, cancelados e destinatários errados. Dois aceites em simultâneo deixam um só dono. Um destinatário no limite do plano recebe `TEAM_LIMIT_REACHED` e o pedido continua `pending`. Depois do aceite, MB WAY, transferência e Stripe ficam desativados e o dinheiro mantém-se.
