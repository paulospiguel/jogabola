# Co-capitão — guia de implementação

> Baseado no código real da `release02`. Encaixa no teu padrão (`withAuthAction`, `ActionResult`, error codes em UPPER_SNAKE, Drizzle query style).

## O que isto faz (e corrige)

1. Adiciona o **co-capitão** usando o role `manager` que já existe no teu `teamMembers.role` e no `addTeamMemberSchema` (enum já inclui `"manager"`). **Sem migration.**
2. Corrige um **bug de permissão**: hoje as actions de mutação usam `userCanAccessTeam`, que devolve `true` para qualquer membro (incluindo `player`). Resultado: qualquer jogador pode marcar jogos e mexer em pagamentos. A introdução de `canManageTeam` fecha esse buraco.

## Os três níveis de permissão (regra mental)

| Helper | Quem passa | Usar em |
|---|---|---|
| `userCanAccessTeam` (já existe) | owner + manager + coach + player | **Leituras** (ver squad, ver eventos, ver pagamentos) |
| `canManageTeam` (NOVO) | owner + manager | **Mutações operacionais** (criar/editar evento, convocar, presença, registar/validar pagamento) |
| `userIsTeamOwner` (já existe) | só owner | **Dono**: billing, apagar equipa, promover/remover co-capitão |

---

## Passo 1 — `canManageTeam` em `src/lib/team-access.ts`

Adiciona `inArray` ao import do drizzle-orm e cola a função:

```ts
import { and, eq, inArray } from "drizzle-orm";

/**
 * Returns true if the user can manage the team operationally:
 * owner OR co-captain (role "manager"). Use this to gate mutations
 * (create/edit events, attendance, payment registration).
 * For owner-only actions (billing, delete team, promote co-captain)
 * use userIsTeamOwner instead.
 */
export async function canManageTeam(
  userId: string,
  teamId: number,
): Promise<boolean> {
  const owned = await db.query.teams.findFirst({
    columns: { id: true },
    where: and(eq(teams.id, teamId), eq(teams.ownerId, userId)),
  });
  if (owned) return true;

  const membership = await db.query.teamMembers.findFirst({
    columns: { id: true },
    where: and(
      eq(teamMembers.teamId, teamId),
      eq(teamMembers.playerId, userId),
      inArray(teamMembers.role, ["owner", "manager"]),
    ),
  });
  return Boolean(membership);
}
```

---

## Passo 2 — schema em `src/schemas/teams.schema.ts`

```ts
export const setCoCaptainSchema = z.object({
  teamId: z.number().int().positive({ message: "VALIDATION_TEAM_REQUIRED" }),
  playerId: z.string().min(1, { message: "VALIDATION_PLAYER_REQUIRED" }),
  makeCoCaptain: z.boolean(),
});

export type SetCoCaptainInput = z.infer<typeof setCoCaptainSchema>;
```

---

## Passo 3 — action em `src/actions/teams.actions.ts`

Adiciona `userIsTeamOwner` ao import de `@/lib/team-access` e `setCoCaptainSchema` ao import de `@/schemas/teams.schema`. Depois:

```ts
export const setCoCaptain = withAuthAction(
  setCoCaptainSchema,
  async (user, { teamId, playerId, makeCoCaptain }) => {
    // Só o dono promove/despromove co-capitães.
    const isOwner = await userIsTeamOwner(user.id, teamId);
    if (!isOwner) {
      return { success: false, error: { code: "FORBIDDEN" } };
    }

    const team = await db.query.teams.findFirst({
      columns: { ownerId: true },
      where: eq(teams.id, teamId),
    });
    if (!team) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    // Nunca mexer no role do próprio dono.
    if (team.ownerId === playerId) {
      return { success: false, error: { code: "CANNOT_MODIFY_OWNER" } };
    }

    const member = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.playerId, playerId),
      ),
    });
    if (!member) {
      return { success: false, error: { code: "PLAYER_NOT_IN_TEAM" } };
    }

    const [updated] = await db
      .update(teamMembers)
      .set({
        role: makeCoCaptain ? "manager" : "player",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(teamMembers.teamId, teamId),
          eq(teamMembers.playerId, playerId),
        ),
      )
      .returning();

    return { success: true, data: updated };
  },
);
```

---

## Passo 4 — trocar os guards (a parte que corrige o bug)

Regra: **se a action MUTA, troca `userCanAccessTeam` por `canManageTeam`. Se só LÊ, deixa `userCanAccessTeam`.**

Confirmadas (mutações — trocar para `canManageTeam`):

| Ficheiro | Action | Guard atual |
|---|---|---|
| `payments.actions.ts` | `updatePaymentStatus` (~337) | `userCanAccessTeam` → `canManageTeam` |
| `payments.actions.ts` | `requestPaymentProof` (~391) | `userCanAccessTeam` → `canManageTeam` |
| `notices.actions.ts` | criar notice (~53, a var já se chama `canManage`) | `userCanAccessTeam` → `canManageTeam` |
| `match-sessions.actions.ts` | criar/editar/apagar evento e convocatória | `userCanAccessTeam` → `canManageTeam` |

Manter `userCanAccessTeam` (leituras): `getTeamPayments`, `getTeamSquad`, `getAthleteProfile`, listar eventos, `switchActiveTeam`.

> Nota honesta: não li o corpo de cada action do `match-sessions.actions.ts` (há vários guards nas linhas ~97, 243, 337, 384, 411, 541). Aplica a regra caso a caso: a que insere/atualiza/apaga → `canManageTeam`; a que faz `select` para mostrar → fica como está. Não troques às cegas.

Lembra de importar `canManageTeam` em cada ficheiro onde o usares.

---

## Checklist de verificação

- [ ] Owner consegue promover um membro a co-capitão e despromover.
- [ ] Co-capitão (manager) consegue criar evento, convocar e validar pagamento.
- [ ] Player **não** consegue criar evento nem mexer em pagamento (o bug fechado).
- [ ] Co-capitão **não** consegue apagar a equipa, mexer em billing, nem promover outros.
- [ ] Tentar promover o próprio owner devolve `CANNOT_MODIFY_OWNER`.

---

## UI mínima (não over-engineer)

No ecrã do plantel (`arena/squads`), no menu de cada membro registado: um toggle "Tornar co-capitão" / "Remover co-capitão" que chama `setCoCaptain`. Mostra um badge `manager` ao lado do nome. Nada mais. Sem ecrã de permissões, sem matriz de roles.
