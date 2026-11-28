# Ambiente local

## Docker Compose

Com Docker Compose e ligação à Internet disponíveis, executa na raiz do repositório:

```bash
docker compose up --build -d
docker compose logs -f app
```

Abre a aplicação em <http://localhost:3000>. Os códigos de acesso por email ficam na caixa local do Mailpit em <http://localhost:8025>. O PostgreSQL local fica disponível em `localhost:5432`.

O Compose usa uma base PostgreSQL local persistente e não carrega automaticamente o ficheiro `.env` para o contentor da aplicação. Resend fica desativado; os emails de autenticação são enviados para o Mailpit. Só `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` são encaminhados, se estiverem definidos para o Compose.

Na primeira execução, `db:local-setup` aplica as migrações quando o schema `public` está vazio. Nas execuções seguintes verifica as colunas necessárias ao arranque. O comando aceita apenas hosts locais. As bases existentes são migradas explicitamente com `pnpm db:migration`.

Para parar a aplicação sem apagar os dados:

```bash
docker compose down
```

## Executar a aplicação no host

```bash
cp .env.example .env
pnpm install
docker compose up -d postgres mailpit
```

Gera um segredo local e coloca-o em `BETTER_AUTH_SECRET` no `.env`:

```bash
openssl rand -base64 32
```

Confirma que `DATABASE_URL` aponta para a base local (`localhost:5432/jogabola`) e depois executa:

```bash
pnpm db:local-setup
pnpm dev
```

## Migrar uma base existente

A migração inicial está em `src/db/migrations/current`. Os ficheiros e o journal anteriores permanecem disponíveis em `src/db/migrations`, para consulta histórica. As migrações atuais registam-se em `jogabola_migrations.__drizzle_migrations`.

A reconciliação suporta bases vazias, o modelo Arena da preparação local anterior criado via `db:push` e bases Arena com IDs de utilizador em texto e as tabelas nucleares de equipas, membros, jogos, reservas e pagamentos. Acrescenta colunas e tabelas em falta, valida o catálogo e adota os nomes canónicos das chaves estrangeiras equivalentes. Preserva os registos e os objetos históricos adicionais. Tipos, defaults e restrições incompatíveis fazem abortar a transação. Por exemplo, reservas duplicadas bloqueiam a criação do índice único e continuam disponíveis para análise.

O journal anterior regista 15 dos 31 ficheiros SQL. Os 16 ficheiros sem registo são `0013_arena_tables.sql`, `0014_user_onboarding.sql` e os ficheiros dos prefixos `0015` a `0027`, incluindo ambas as versões de `0017`. Os prefixos repetidos são `0013` (Arena e OTP), `0014` (pagamento e onboarding) e `0017` (plano). `0013_guest_otp.sql` contém apenas um comentário. A entrada de `0014_payment_required.sql` tem um timestamp anterior ao da entrada que a precede.

Antes de migrar uma base com dados, cria uma cópia com `pg_dump` e testa o restauro com `pg_restore` num destino descartável. Aplica a migração primeiro nessa cópia, verifica os dados e volta a executar o comando para confirmar que termina com zero migrações pendentes. A migração usa bloqueios de DDL. Para um ambiente partilhado, agenda a aplicação num período em que as escritas possam ser interrompidas.

Com `DATABASE_URL` definido para o destino pretendido, aplica as migrações:

```bash
pnpm db:migration
```

As alterações futuras usam `pnpm db:generate --name <nome>` e SQL revisto. Mantém o SQL já aplicado, pois o comando verifica o seu hash antes de aplicar alterações adicionais.

Para repetir os testes, usa um servidor PostgreSQL local descartável e uma role com permissão `CREATEDB`. Define `JOGABOLA_TEST_DATABASE_URL` para a base administrativa desse servidor. O teste cria bases próprias e remove-as quando termina.

```bash
node scripts/test-db-migrations.mjs
```

A bateria de integração das Server Actions de clubes e calendário usa a mesma variável e também cria e remove uma base própria. Sem a variável, os testes ficam marcados como ignorados.

```bash
JOGABOLA_TEST_DATABASE_URL=postgresql://<utilizador>:<palavra-passe>@localhost:5432/postgres pnpm test
```

## Login local sem Mailpit

Sem Mailpit, arranca a aplicação com `SMTP_HOST` vazio. Com `RESEND_API_KEY` também vazio e fora de produção, o Better Auth escreve o código no log do servidor em vez de enviar email:

```bash
SMTP_HOST= pnpm dev
# no log: [auth:email-otp] capitao.a@jogabola.test -> 123456
```

Em alternativa, lê o código pendente diretamente da base local. O script recusa hosts que não sejam locais e `NODE_ENV=production`, e só lê o que o Better Auth guardou; a autenticação de produção não muda.

```bash
node scripts/local-otp.mjs capitao.a@jogabola.test             # código pedido no ecrã /auth
node scripts/local-otp.mjs capitao.a@jogabola.test --request   # pede o código à app local e imprime-o
```

## Dados sintéticos do calendário de clubes (etapa 2)

```bash
node scripts/seed-club-calendar.mjs
```

Cria dois clubes, equipas, épocas, adversários, jogos e convocatórias, e um utilizador por papel de QA (`@jogabola.test`). Voltar a executar substitui os dados anteriores do seed; os IDs mudam e são impressos no fim. Recusa hosts que não sejam locais.

| Email | Papel |
| --- | --- |
| `capitao.a@jogabola.test` | Dono das equipas Leões da Tapada (A e B), administrador do clube A |
| `atleta.a@jogabola.test` | Plantel do clube A, membro do clube: só leitura |
| `staff.a@jogabola.test` | Treinador no staff da equipa A e no plantel, membro do clube A: lê, não cria jogos |
| `capitao.livre@jogabola.test` | Dono do Bairro Alto FC sem clube: estado vazio e "Criar clube" |
| `capitao.b@jogabola.test` | Dono dos Dragões do Restelo, administrador do clube B |
| `membro.b@jogabola.test` | Membro do clube B: não vê nada do clube A |

A área fica em `/arena/club` (sidebar no desktop, cartão "Clube" no início em mobile).
