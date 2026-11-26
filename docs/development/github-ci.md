# Pull requests e CI

| Check | Quando corre | O que valida |
| --- | --- | --- |
| `CI / verify` | Pull requests, pushes para `master` e `releases/**`, e execução manual | Lockfile, Biome, TypeScript, metadados Drizzle, Vitest e build Next.js |
| `Local stack / smoke` | Pull requests que alteram a stack local, scripts, dependências, persistência ou autenticação, e execução manual | Arranque com Docker Compose, login via Mailpit, migrações em PostgreSQL e persistência após recriação do contentor |

O contexto `verify` corre em todos os pull requests e pode ser exigido pela
proteção da branch. O workflow `Local stack` tem filtros de ficheiros. Um pull
request fora desses filtros pode ficar à espera se o check `smoke` for exigido
como regra global.

## Revisão do Copilot

A revisão automática é ligada por uma [regra do GitHub][automatic-review].
Em **Settings → Rulesets**, importa
[copilot-review.json](../../.github/rulesets/copilot-review.json) através de
**New ruleset → Import a ruleset**. Se a regra já existir, confirma a
configuração pelo nome **JogaBola Copilot review**.

O ficheiro ativa a revisão de pull requests elegíveis quando estiverem
prontos para revisão e se dirigirem à branch principal. A revisão de
rascunhos e de cada novo push está desativada. O autor precisa de acesso ao
Copilot code review e de créditos disponíveis. Os critérios da revisão estão
em [copilot-instructions.md](../../.github/copilot-instructions.md).

No pull request, o resultado da pipeline aparece em **Checks** e a revisão
do Copilot aparece na conversa com os comentários nas linhas relevantes. O
Copilot também pode ser solicitado em **Reviewers** quando estiver disponível.

[automatic-review]: https://docs.github.com/en/copilot/how-tos/copilot-on-github/set-up-copilot/configure-code-review
