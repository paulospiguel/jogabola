# Staff da equipa, Plantel e transferência de propriedade — Design

**Data:** 2026-11-26 · **Tamanho:** projeto (3 fases) · **ADR a criar:** `docs/adr/0006-team-staff-and-roster.md`

## 1. Intenção e porquê

No rumo **AI Club OS**, uma equipa é gerida por pessoas com funções distintas. Gerir não implica jogar. Hoje `team_members` mistura gestão (`owner`, `manager` = co-capitão) e Plantel (`player`): quem cria a equipa entra automaticamente como atleta e o co-capitão é o único nível intermédio de gestão.

O objetivo é servir clubes de qualquer dimensão: só o dono; o dono e mais uma pessoa; ou o dono e uma equipa técnica completa (treinador, financeiro, diretor…). O dono controla quem gere e o que cada pessoa pode alterar, e pode transferir a equipa para outra pessoa.

## 2. Objetivos

1. Separar **staff** (gestão) de **Plantel** (atletas) em tabelas próprias.
2. Quem cria uma equipa é **dono** e não fica atleta automaticamente. Pode optar por ser atleta: modal logo após criar e interruptor por equipa no Perfil.
3. O conceito **co-capitão desaparece** da UI e dos dados e passa a **membro de staff**.
4. O dono **promove** um atleta a staff (a pessoa fica atleta e staff) e **despromove** (perde o staff e mantém-se atleta).
5. Cada membro de staff tem **cargo** e **privilégios granulares**, que o dono atribui ou retira individualmente.
6. O dono pode **transferir a equipa** para um membro ou para uma pessoa nova (por email, sem conta ou sem vínculo a clube).
7. Todas as alterações de staff, privilégios e propriedade ficam **registadas**.

## 3. Não-objetivos

- Unificar `players` (atletas sem conta, adicionados à mão) com o Plantel registado. Fica como está.
- Convidar alguém **de fora** diretamente para staff (ex.: treinador que não joga). Nesta fase, o staff vem sempre do Plantel.
- Staff virtual de IA (Secretário). O modelo de privilégios deve permitir encaixá-lo depois, mas fica para o ADR da etapa 3 do AI Club OS.
- Alterar o vínculo da equipa a um clube (ADR 0005) durante uma transferência.
- Transferir a propriedade do clube.

## 4. Anti-objetivos (falhou mesmo que funcione)

- Donos ou co-capitães existentes perderem lugar no Plantel, presenças, estatísticas, pagamentos ou multas.
- Um atleta sem privilégio conseguir alterar algo de gestão (inclui as falhas já existentes listadas em §8).
- O dono ficar sem acesso à sua equipa por não ser atleta.
- Uma transferência deixar a equipa sem dono, com dois donos ou aceite por quem não é o destinatário.
- Repetir uma ação (duplo clique, retry) duplicar efeitos.

## 5. Abordagens consideradas

| | Abordagem | Decisão |
|---|---|---|
| **1** | `team_staff` com `permissions text[]` validado por um catálogo no código e por uma constraint na BD, mais uma tabela de registo | **Escolhida.** Simples, lê-se numa só consulta, e um privilégio novo não exige uma coluna nova. |
| 2 | Uma linha por privilégio (`team_staff_permissions`) | Rejeitada: mais escritas e leituras para ~6 privilégios, e o registo continuaria a ser necessário à parte. |
| 3 | Uma coluna booleana por privilégio | Rejeitada: cada privilégio novo obriga a migração e encaixa mal no staff virtual futuro. |

Antes desta, foi rejeitada uma coluna `is_athlete` em `team_members` (opção A). Mantinha a mistura entre gestão e Plantel.

## 6. Modelo de domínio

| Papel | Fonte de verdade | Pode |
|---|---|---|
| **Dono** | `teams.owner_id` (único) | Tudo. É staff implícito e não tem linha em `team_staff`. Só ele gere staff, privilégios, transferência, apagar a equipa e faturação. |
| **Membro de staff** | `team_staff` | **Ver** tudo da equipa. **Alterar** só o que os seus privilégios permitem. |
| **Atleta** | `team_members` (agora só Plantel) | O que um atleta pode hoje (presenças próprias, comprovativos, chat…). |

Uma pessoa pode ser **atleta e staff** ao mesmo tempo. O dono pode ser **atleta** ou não.

**Acesso (ver) à equipa** = dono **ou** staff **ou** atleta.

### Catálogo de privilégios (constante TypeScript `STAFF_PERMISSIONS`)

| Chave | Cobre |
|---|---|
| `events.manage` | Criar, editar e cancelar convocatórias; recorrências |
| `attendance.manage` | Confirmar ou alterar presenças de atletas; lista de espera |
| `roster.manage` | Adicionar e remover atletas do Plantel; enviar email a um atleta |
| `payments.manage` | Racha, validação de comprovativos, multas, definições de pagamento da equipa |
| `communication.manage` | Mural de avisos e comunicações dirigidas ao Plantel |
| `match.manage` | Relatório de jogo, estatísticas e balanceamento de equipas |

Privilégios **reservados ao dono**, sem interruptor: gerir staff e privilégios, transferir a equipa, apagar a equipa, faturação e plano, e as ações competitivas do ADR 0005.

### Cargos (rótulo + sugestão; não dão poder)

`coach` (treinador), `director` (diretor), `finance` (financeiro), `secretary` (secretário), `other` (outro).

Ao escolher o cargo, os privilégios vêm pré-preenchidos e o dono ajusta:

- coach → `events`, `attendance`, `match`
- director → todos
- finance → `payments`
- secretary → `events`, `attendance`, `communication`
- other → nenhum

## 7. Dados (Drizzle + Postgres)

- **`team_staff`**: `id`, `team_id` (FK, cascade), `user_id` (FK user, cascade), `title` (cargo), `permissions text[] not null default '{}'`, `created_by`, `created_at`, `updated_at`.
  - Único `(team_id, user_id)`.
  - Constraint: `permissions <@ ARRAY[...catálogo]`.
  - O dono nunca tem linha.
- **`team_members`**: passa a significar só Plantel.
  - A coluna `role` deixa de ter significado de gestão. Valores existentes `owner`/`manager` são normalizados para `player` depois de copiados.
  - A coluna mantém-se nesta fase para não partir leituras; a remoção fica para depois.
- **`team_staff_events`** (registo, só inserções): `id`, `team_id`, `actor_user_id`, `subject_user_id`, `type` (`promoted` | `demoted` | `permissions_changed` | `title_changed` | `ownership_transfer_requested` | `ownership_transfer_cancelled` | `ownership_transfer_accepted` | `ownership_transfer_expired` | `athlete_opt_in` | `athlete_opt_out`), `payload jsonb`, `created_at`.
- **`team_ownership_transfers`**: `id`, `team_id`, `from_user_id`, `to_user_id` (nullable), `to_email` (normalizado), `token_hash`, `status` (`pending` | `accepted` | `cancelled` | `expired`), `expires_at` (+7 dias), `created_at`, `resolved_at`.
  - Índice parcial único: um `pending` por equipa.

### Migração (idempotente)

1. Criar tabelas e constraints.
2. Para cada `team_members.role = 'manager'`: inserir em `team_staff` com `title = 'other'` e `permissions = {events.manage, attendance.manage, payments.manage, communication.manage, roster.manage}` — tudo o que o co-capitão consegue fazer hoje (inclui avisos via `canManageTeam` e adicionar ao Plantel, que hoje só exige acesso). Nada é perdido.
3. Linhas com `role = 'owner'` **permanecem no Plantel** (donos existentes continuam atletas).
4. Normalizar `role` de `owner`/`manager` para `player`.
5. Verificar com `scripts/test-db-migrations.mjs` e `pnpm db:local-setup`.

## 8. Autorização no servidor

Novo módulo `src/lib/team-authz.ts`, substituto de `team-access.ts` e `team-capabilities.ts`:

- `getTeamAccess(userId, teamId)` → `{ isOwner, isAthlete, staff: { title, permissions } | null }` numa só consulta.
- `canViewTeam(userId, teamId)`
- `can(userId, teamId, permission)`: dono → `true`; staff com a permissão → `true`.
- `requireOwner(userId, teamId)`

Regras:

- Mutações verificam a permissão na operação de escrita.
- Nas operações por identificador, o `teamId` é obtido do registo persistido (ex.: o evento), nunca do cliente.
- A permissão vista no cliente é só apresentação.

**Substituições** (todos os pontos de `canManageTeam` / `userIsTeamOwner` / `MANAGEMENT_ROLES`):

| Ficheiro | Passa a exigir |
|---|---|
| `match-sessions.actions.ts` | `events.manage` |
| `attendance.actions.ts` | `attendance.manage` |
| `notices.actions.ts` | `communication.manage` |
| `payments/payment-lifecycle`, `payment-proofs`, `payment-verification`, `payments.actions.ts`, `lib/fines.ts` | `payments.manage` |
| `team-balancer.actions.ts`, relatório e estatísticas | `match.manage` |
| `teams.actions.ts`: `removePlayerFromRoster` (hoje só dono), `addPlayerToRoster`, `sendRosterPlayerEmail` | `roster.manage` |
| `setCoCaptain` | Removido. Substituído pelas ações de staff (§9). |

**Falhas existentes corrigidas nesta entrega:**

- `addTeamMember` usa `withAction`, sem autenticação nem autorização. Passa a interna (não exportada como Server Action) ou exige `roster.manage`.
- `addPlayerToRoster` só exige acesso à equipa (qualquer atleta adiciona). Passa a exigir `roster.manage`.
- `upsertTeamPaymentSettings` só exige acesso. Passa a exigir `payments.manage`.

Estas correções são também o pré-requisito do ADR 0005.

### Regras de Plantel vs staff (decisão do builder)
- Quem tem `roster.manage` remove atletas comuns. **Não** remove o dono nem um membro de staff do Plantel — só o dono o faz. Cada pessoa pode sempre sair do Plantel via `setMyAthleteStatus`.
- Sair ou ser removido do Plantel **não** despromove: o staff mantém-se até o dono despromover. ("Staff vem do Plantel" é só a origem da promoção.)

### Leituras e notificações hoje presas a `teams.owner_id` (decisão do builder, fase 1)
- Notificações de comprovativos: dono **e** staff com `payments.manage`.
- Chat de evento: dono, staff com `events.manage`, e atletas confirmados.
- Botão de editar evento (`events/[id]/page.tsx`): visível para quem tem `events.manage` (hoje usa `userIsTeamOwner`).

### Pontos de código sem autorização a cobrir
- `team-balancer.actions.ts` não tem autorização → passa a `match.manage`.
- `lib/fines.ts` não tem mutação exposta; multas ficam sob `payments.manage` quando surgir escrita.
- Não há hoje escrita de relatório/estatísticas; `match.manage` fica reservado para isso.
- Segundo caminho de criação de equipa em `match-sessions.actions.ts` ("Minha Equipa" automática) segue as mesmas regras de dono não-atleta.

## 9. Server Actions novas

- `setMyAthleteStatus({ teamId, isAthlete })`: o próprio utilizador (dono ou staff) entra ou sai do Plantel; insere ou remove a sua linha em `team_members`. Sair não apaga presenças, pagamentos nem estatísticas históricas.
- `promoteToStaff({ teamId, userId, title, permissions })`: só o dono; o alvo tem de ser atleta registado.
- `updateStaffMember({ teamId, userId, title?, permissions? })`: só o dono.
- `demoteStaff({ teamId, userId })`: só o dono; remove a linha de `team_staff`; o lugar no Plantel mantém-se.
- `requestOwnershipTransfer({ teamId, toUserId? | toEmail, confirmTeamName })`: só o dono; `confirmTeamName` tem de coincidir; cria o pedido, envia email com link de token e notificação na app se o destinatário tiver conta. Só o hash SHA-256 do token é guardado. Antes do lançamento (`APP_LAUNCHED !== "true"`), um destinatário por email tem de passar a mesma verificação de tester do layout `(protected)`; caso contrário, `RECIPIENT_NOT_ELIGIBLE`. Se o email não sair, o pedido acabado de criar passa a `cancelled` (evento `ownership_transfer_cancelled` com `reason: "email_failed"`) e a ação devolve `EMAIL_SEND_FAILED`.
- `cancelOwnershipTransfer({ teamId })`: só o dono.
- `acceptOwnershipTransfer({ token })` / `acceptOwnershipTransferById({ transferId })`: o utilizador autenticado tem de corresponder a `to_user_id` ou a `to_email` verificado. Antes do lançamento tem de passar a verificação de tester (`RECIPIENT_NOT_ELIGIBLE`; a página `/transfer/[token]` redireciona para `/waitlist`). Um pedido para um membro só é aceite enquanto o destinatário estiver no Plantel ou no staff (`RECIPIENT_NOT_MEMBER`). Numa transação com bloqueio da linha do pedido:
  1. Verifica `pending` e não expirado.
  2. `teams.owner_id` ← destinatário.
  3. Remove a linha de `team_staff` do destinatário, se existir (passa a dono).
  4. O dono antigo **não fica no staff**; a sua linha em `team_members` mantém-se só se já era atleta.
  5. **Pagamentos:** desliga `stripeEnabled`, `mbwayEnabled` e `transferEnabled` em `team_payment_settings` e marca `payout_reconfigure_required_at = now()`. Os dados ficam guardados mas inativos até o novo dono os reconfigurar; o dinheiro (`cashEnabled`) mantém-se. Os comprovativos pendentes passam a notificar o novo dono e o staff com `payments.manage`. Enquanto a marca existir:
     - todas as leituras que chegam ao cliente (`getTeamPaymentSettings`, `getPublicTeamPaymentSettings`, `resolveTeamPaymentConfig` e páginas de evento/pagamento) devolvem os dados de MB WAY, transferência e Stripe como `null` e os métodos desativados;
     - `upsertTeamPaymentSettings` e o formulário de evento (`createEvent`/`updateEvent`) recusam ativar MB WAY, transferência ou Stripe com `PAYOUT_RECONFIGURE_REQUIRED`, exceto ao **dono** (`isTeamOwner`) que envie dados novos desse método (MB WAY: número e nome; transferência: IBAN e titular). O Stripe fica desativado enquanto a marca existir, porque não há fluxo Connect na app;
     - os dados antigos ficam guardados mas mascarados enquanto a marca existir; campos de dados vazios não os apagam;
     - a primeira gravação do dono com dados novos limpa a marca e apaga os dados antigos que não substituiu: os métodos não reenviados ficam desativados e sem dados, e a conta Stripe é sempre apagada;
     - o formulário de evento só altera o MB WAY; mantém o estado dos outros métodos e não reescreve dados que não recebeu;
     - a folha de definições mostra o aviso "Confirma os dados de pagamento da equipa" com os campos vazios.
  6. **Limite do plano:** se o destinatário já atingiu o limite de equipas do seu plano (`canCreateTeam` sobre as equipas de que é dono), o aceite é recusado com `TEAM_LIMIT_REACHED` e uma mensagem de upgrade. O pedido continua `pending` até expirar.
  7. `status = accepted`.
  8. Regista o evento.
  9. Repetir o aceite é idempotente.
- `declineOwnershipTransfer({ token })`: o destinatário recusa. Fica guardado como `cancelled` com `reason: "declined"` no evento.
- Expiração: tratada no momento da leitura/aceite (`expires_at < now` → `expired`). Não exige worker.

Todas registam em `team_staff_events` e fazem `revalidatePath("/arena", "layout")`.

## 10. UI (mobile-first, desktop com layout próprio; i18n pt/en/es/fr)

- **Criar equipa:** o ecrã de sucesso pergunta "Queres fazer parte do plantel de atletas?" com "Sim, quero jogar" e "Agora não". Sai o fecho automático de 2 s.
- **Perfil → Equipas:** um interruptor "Sou atleta nesta equipa" por equipa onde a pessoa é dono ou staff. A lista passa a incluir equipas onde a pessoa é dono ou staff sem ser atleta.
- **Plantel:**
  - Distintivo de staff (cargo) nos atletas que também são staff.
  - O dono vê a ação "Promover a staff" num atleta, com folha de cargo e privilégios pré-preenchidos editáveis.
- **Nova secção "Staff" na equipa** (só visível a staff e dono):
  - Lista do dono e dos membros de staff, com cargo e privilégios.
  - O dono edita, despromove e acede a "Transferir equipa".
- **Transferir equipa:**
  - Aviso: "Os métodos de pagamento (MB WAY, transferência, Stripe) ficam desativados até o novo dono os configurar."
  - Folha com escolha de um membro ou de um email.
  - Aviso: "Vais perder todos os privilégios; se não és atleta, perdes o acesso à equipa".
  - Confirmação escrevendo o nome da equipa.
  - Estado do pedido pendente, com cancelar.
- **Aceitar transferência:**
  - Página `/transfer/[token]`, com login ou registo se necessário.
  - Também um cartão na app para o destinatário com conta.
- Remover todas as referências a "co-capitão" nos textos e locales.
- O gate "Cria uma equipa primeiro" considera dono, staff ou atleta.

## 11. Fases (cada uma deixa a app funcional)

1. **Separar staff e Plantel:**
   - `team_staff` com privilégios fixos equivalentes ao co-capitão.
   - Migração e `team-authz.ts` com substituição de todos os pontos de autorização.
   - Correção das 3 falhas.
   - Dono como atleta opcional (modal e Perfil).
   - Ação de promover e despromover (UI mínima) a substituir o co-capitão.
2. **Privilégios granulares:**
   - Catálogo completo, cargos e predefinições.
   - Secção Staff e edição de privilégios.
   - Verificações por permissão em todos os pontos.
3. **Transferência de equipa:** tabela, ações, emails (Mailpit em dev), página de aceite e registo.

## 12. Verificação

- **Testes unitários:**
  - `can()` para dono, staff com e sem permissão, atleta e estranho.
  - Migração (manager → staff; owner permanece atleta).
  - Cada ação nova: autorização, alvo e idempotência.
  - Transferência: expirada, cancelada, destinatário errado, aceite duplo, corrida com dois aceites, destinatário no limite do plano, métodos de pagamento desativados após aceite.
- **Testes das falhas corrigidas:** um atleta sem privilégio recebe `FORBIDDEN` em `addPlayerToRoster`, `upsertTeamPaymentSettings` e na antiga `addTeamMember`.
- **QA:** `qa-integration-database` para ações, migração e authz; `qa-journeys-ui` para criar equipa → modal, promover/despromover, transferir/aceitar e i18n.
- **Gates:** `pnpm lint`, `pnpm ts-check`, `pnpm test`, `pnpm build`.
- **Browser** (`localhost:3000` + Mailpit): fluxo completo com dois utilizadores de teste.

## 13. Decisões do builder (minhas, a confirmar)

- O dono não tem linha em `team_staff`; a propriedade vem só de `teams.owner_id` (alinhado com o ADR 0005).
- Co-capitães migram com cargo `other` e os 5 privilégios que exercem hoje (todos menos `match.manage`).
- `removePlayerFromRoster` passa de "só dono" para `roster.manage`.
- A expiração da transferência é verificada no acesso, sem tarefa agendada.
- `team_members.role` fica na tabela, normalizada para `player`; a remoção fica para depois.
- O destinatário por email tem de ter o email verificado para aceitar.
