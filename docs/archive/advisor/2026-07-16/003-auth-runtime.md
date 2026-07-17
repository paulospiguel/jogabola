# Plano 003: Estabilizar autenticação e logging de produção

> **Drift check:** `git diff --stat 2c1eb85..HEAD -- src/constants/app.ts 'src/app/(mobile)/auth/page.tsx' src/lib/auth.ts src/lib/safe-error.ts`  
> Divergência nos símbolos citados é STOP.

## Estado

- **Prioridade:** P0
- **Esforço:** M
- **Risco:** Médio
- **Depende de:** 001
- **Categoria:** bug/segurança
- **Planeado em:** `2c1eb85`, 2026-07-16

## Porque importa

O login produz hydration mismatch porque o servidor e o cliente resolvem versões diferentes. Em paralelo, o handler de erro escreve stack e URL sincronamente num ficheiro local, uma estratégia frágil em serverless e com risco de reter dados sensíveis.

## Estado atual

- `src/constants/app.ts:26`: `VERSION: process.env.VERSION || "1.0.0"` num módulo consumido por Client Component.
- `src/app/(mobile)/auth/page.tsx:491-498`: renderiza a versão durante SSR/hidratação.
- Browser observado: servidor `1.0.1`, cliente `1.0.0`.
- `src/lib/auth.ts:48-70`: `fs.appendFileSync` guarda stack, URL e método em `auth-error.log`.

## Âmbito

**Incluído:** `src/constants/app.ts`, `src/app/(mobile)/auth/page.tsx`, `src/lib/auth.ts`, `src/lib/__tests__/auth-runtime.test.ts` (novo) e uso do exemplar `src/lib/safe-error.ts` integrado no plano 001.  
**Excluído:** mudança de Better Auth, migração de contas, providers OAuth e passkeys.

## Git workflow

Branch `codex/003-auth-runtime`, commits convencionais. Não fazer push sem instrução.

## Passos

1. Tornar a versão determinística usando `NEXT_PUBLIC_APP_VERSION` com fallback único `package.json.version`; não oferecer alternativas ao executor e não usar `process.env.VERSION` em Client Components.  
   **Verificar:** teste importa `APP.VERSION` com/sem env e obtém string estável.
2. Substituir `fs.appendFileSync` por `console.error("[auth] request failed", { error: classifyErrorSafely(error), method })`, importando `classifyErrorSafely` de `src/lib/safe-error.ts`. Não registar URL, stack, query string, tokens, OTP ou dados pessoais.
3. Desativar `emailAndPassword` removendo esse bloco de `src/lib/auth.ts`. A pesquisa auditada `rg 'signIn\.email\b|signUp\.email\b|sign-up/email|sign-in/email' src` não encontrou consumidores; os fluxos suportados são OTP, Google e passkey.  
   **Verificar antes de editar:** repetir o `rg`; qualquer match novo é STOP e exige plano de migração.
4. Adicionar teste que renderiza `/auth` com valores de ambiente diferentes e confirma markup estável.
5. Fazer smoke de OTP, Google e passkey em ambiente apropriado; não criar credenciais no teste automatizado.

**Verificação:**

```bash
pnpm exec vitest run src/lib/__tests__/auth-runtime.test.ts
npx biome check src/constants/app.ts 'src/app/(mobile)/auth/page.tsx' src/lib/auth.ts src/lib/__tests__/auth-runtime.test.ts
pnpm ts-check
pnpm build
git grep 'appendFileSync' -- src/lib/auth.ts
```

Esperado: gates verdes, grep vazio e consola sem hydration mismatch em `/auth`.

## Test plan

- `src/lib/__tests__/auth-runtime.test.ts`: fallback de versão; sanitização de erro; URL sem query; ausência de stack em produção.
- Smoke manual: `/auth` em mobile e desktop, OTP inválido e retorno a `/arena`.

## STOP

- Desativar password afetaria utilizadores existentes: parar e apresentar dados de utilização/migração.
- O fornecedor de observabilidade exigiria transmitir stack/PII sem configuração de redaction aprovada.

## Manutenção

Versão apresentada ao utilizador deve vir de uma única variável pública definida no build; logging auth deve passar por redaction central.
