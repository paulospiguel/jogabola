# Ambiente local

## Docker Compose

Com Docker Compose e ligação à Internet disponíveis, executa na raiz do repositório:

```bash
docker compose up --build -d
docker compose logs -f app
```

Abre a aplicação em <http://localhost:3000>. Os códigos de acesso por email ficam na caixa local do Mailpit em <http://localhost:8025>. O PostgreSQL local fica disponível em `localhost:5432`.

O Compose usa uma base PostgreSQL local persistente e não carrega automaticamente o ficheiro `.env` para o contentor da aplicação. Resend fica desativado; os emails de autenticação são enviados para o Mailpit. Só `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` são encaminhados, se estiverem definidos para o Compose.

Na primeira execução, `db:local-setup` cria o esquema Drizzle atual apenas quando não encontra tabelas no schema `public`. Nas execuções seguintes não volta a sincronizar a base. O comando recusa URLs cujo host não seja local e verifica colunas chave das migrações recentes antes de arrancar a aplicação.

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

O inicializador não altera qualquer base que já tenha tabelas. Para actualizar manualmente o esquema de uma base de desenvolvimento existente, revê as alterações e executa `pnpm db:push` de forma explícita.
