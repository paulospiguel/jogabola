# JogaBola

O JogaBola é uma plataforma de gestão de equipas de futebol amador: convocatórias, plantel, estatísticas, chat por evento, rankings e histórico de época.

## Stack

- Next.js 16 e React 19
- TypeScript e pnpm
- Drizzle ORM e PostgreSQL
- better-auth com passkeys
- Ably para chat em tempo real
- next-intl com quatro línguas (português, inglês, espanhol e francês)
- Tailwind CSS 4
- Statsig para analytics no cliente e no servidor
- Resend para email transacional
- Cloudflare R2 para armazenamento de ficheiros
- Vercel para alojamento e tarefas cron

## Começar

```bash
pnpm install
docker compose up -d
cp .env.example .env # preencher valores
# Em .env, usar DATABASE_URL=postgresql://jogabola:jogabola@localhost:5432/jogabola
# e preencher BETTER_AUTH_SECRET com o resultado de: openssl rand -base64 32
pnpm db:migration
pnpm dev
```

A aplicação fica disponível em `http://localhost:3000`.

## Scripts

| Comando | Finalidade |
| --- | --- |
| `pnpm build` | Cria a build de produção com Next.js. |
| `pnpm clean` | Remove `.next` e `node_modules` através de `git clean`. |
| `pnpm dev` | Inicia o servidor de desenvolvimento com Turbopack. |
| `pnpm lint` | Valida `src` com o Biome. |
| `pnpm test` | Executa os testes uma vez com Vitest. |
| `pnpm test:watch` | Executa os testes em modo interativo com Vitest. |
| `pnpm ts-check` | Verifica os tipos TypeScript sem emitir ficheiros. |
| `pnpm start` | Inicia a build de produção do Next.js. |
| `pnpm db:push` | Sincroniza diretamente o schema Drizzle com a base de dados. |
| `pnpm db:studio` | Abre o Drizzle Studio. |
| `pnpm db:migration` | Aplica as migrações Drizzle pendentes. |
| `pnpm db:generate` | Gera migrações Drizzle a partir do schema. |

## Documentação

| Ficheiro | Conteúdo |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Instruções canónicas do projeto para agentes e contribuidores. |
| [`PRODUCT.md`](PRODUCT.md) | Intenção do produto, utilizadores e princípios. |
| [`CONTEXT.md`](CONTEXT.md) | Glossário de domínio e convenções de código. |
| [`DESIGN.md`](DESIGN.md) | Sistema visual, tokens, componentes e microinterações. |
| [`docs/adr/`](docs/adr/) | Registos das decisões de arquitetura. |
| [`docs/superpowers/plans/`](docs/superpowers/plans/) | Planos de implementação pendentes e históricos. |

## Environment variables

| Variável | Finalidade |
| --- | --- |
| `DATABASE_URL` | Ligação PostgreSQL usada pelo Drizzle e pela aplicação. |
| `BETTER_AUTH_SECRET` | Segredo usado para assinar dados de autenticação. |
| `GOOGLE_CLIENT_ID` | Identificador OAuth da aplicação Google. |
| `GOOGLE_CLIENT_SECRET` | Segredo OAuth da aplicação Google. |
| `APPLE_CLIENT_ID` | Identificador opcional do serviço Apple Sign In. |
| `APPLE_CLIENT_SECRET` | Segredo opcional do serviço Apple Sign In. |
| `APPLE_TEAM_ID` | Identificador opcional da equipa Apple Developer. |
| `APPLE_KEY_ID` | Identificador opcional da chave Apple Sign In. |
| `APPLE_PRIVATE_KEY` | Chave privada opcional do Apple Sign In. |
| `PASSKEY_RP_ID` | Hostname opcional que substitui o relying party ID derivado para passkeys. |
| `TRUSTED_ORIGINS` | Origens adicionais opcionais, separadas por vírgulas, aceites pela autenticação. |
| `NEXT_PUBLIC_URL` | URL pública base usada no cliente e em utilitários da aplicação. |
| `NEXT_PUBLIC_APP_URL` | URL canónica da aplicação usada pela autenticação e pelo cliente. |
| `NEXT_PUBLIC_MAIN_DOMAIN` | Domínio público principal opcional; usa `jogabola.app` quando omitido. |
| `RESEND_API_KEY` | Chave da API Resend para envio de emails transacionais. |
| `EMAIL_FROM` | Remetente apresentado nos emails enviados pela aplicação. |
| `NEXT_PUBLIC_IS_BETA` | Ativa a apresentação pública do estado beta. |
| `APP_LAUNCHED` | Controla se a aplicação já foi lançada. |
| `NOTION_API_KEY` | Chave da API Notion usada pela integração de lista de espera. |
| `NOTION_WAITLIST_DATA_SOURCE_ID` | Identificador da fonte de dados Notion da lista de espera. |
| `R2_ENDPOINT` | Endpoint S3 da conta Cloudflare R2. |
| `R2_ACCESS_KEY_ID` | Identificador da chave de acesso ao R2. |
| `R2_SECRET_ACCESS_KEY` | Segredo da chave de acesso ao R2. |
| `R2_BUCKET_NAME` | Nome do bucket R2 que guarda os ficheiros. |
| `R2_PUBLIC_URL` | URL pública base dos ficheiros guardados no R2. |
| `ABLY_API_KEY` | Chave do Ably para emitir tokens e suportar chat em tempo real. |
| `NEXT_PUBLIC_STATSIG_CLIENT_KEY` | Chave pública do SDK Statsig no cliente. |
| `STATSIG_SERVER_SECRET_KEY` | Chave secreta do Statsig para eventos do servidor. |
| `CRON_SECRET` | Segredo Bearer que autentica as tarefas cron da Vercel. |
