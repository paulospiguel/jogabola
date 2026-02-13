# SKILL: Clean Code & Modular Architecture (Next.js + TS + Server Actions + React Query + Expo-ready)

## Objetivo
Garantir código previsível, modular, testável e escalável.
Sempre que um ficheiro/componente cresce demais ou mistura responsabilidades, refatorar automaticamente para módulos menores.
Padronizar estrutura de pastas e decisões de arquitetura para Next.js (App Router) + TypeScript + Server Actions + React Query (useQuery) e compatibilidade mental com Expo (componentização e domínio).

---

## Princípios (obrigatórios)
1) SRP / separação de responsabilidades:
   - UI ≠ lógica ≠ acesso a dados ≠ validação ≠ regras de domínio.
2) Leitura > escrita:
   - Código deve ser óbvio à primeira leitura.
3) Composição > herança:
   - Preferir componentes pequenos e compostos.
4) "Thin UI, fat domain":
   - UI fina. Regras e decisões ficam no domínio/serviços.
5) Tipos como contrato:
   - TypeScript é parte da arquitetura, não “decorativo”.

---

## Limiares de refactor (gatilhos automáticos)
Refatorar SEMPRE que um ficheiro atingir qualquer um destes:
- > 200 linhas (UI) ou > 150 linhas (lógica/serviços)
- > 3 níveis de indentação frequentes
- > 3 responsabilidades claras no mesmo ficheiro
- > 8 props no componente (sinal de “God component”)
- mais de 1 efeito colateral (ex: fetch + parsing + state + UI) no mesmo local

Quando um gatilho acontecer:
A) criar subcomponentes (presentational)
B) extrair hooks (lógica de UI)
C) extrair services/use-cases (domínio)
D) extrair validações e schemas (Zod)
E) extrair mappers/formatters (adapters)
F) reorganizar pastas por feature

---

## Regras de estrutura de pastas (padrão por feature)
Usar "feature-first", não "type-first".

### Next.js (App Router) — recomendado
src/
  app/
    (public)/
    (auth)/
    (protected)/
    api/ (se existir)
  features/
    <feature>/
      _contracts/        # tipos públicos (DTOs, interfaces)
      actions/           # server actions (Next.js)
      api/               # client fetchers (se necessário)
      components/        # UI components (client/server conforme)
      hooks/             # hooks de UI (useX)
      queries/           # React Query keys + hooks
      services/          # use-cases / domain services
      schemas/           # zod schemas
      mappers/           # adapters, transformers
      utils/             # helpers da feature
      index.ts           # barrel export (apenas públicos)
  shared/
    components/
    hooks/
    utils/
    constants/
    types/
  lib/
    db/
    auth/
    http/
    config/

### Regras
- Nada de "components/" global gigante sem critério. Componentes reutilizáveis vão para shared/components; componentes específicos ficam na feature.
- Ficheiros "index.ts" apenas para exports públicos; evitar barrel exports internos que atrapalhem tree-shaking.
- Import boundaries:
  - feature pode importar shared e lib
  - shared NÃO importa feature
  - app pode importar features/shared/lib

---

## Padrão de Componentes (React / Next.js)
### Separar:
- <FeaturePage/> (orchestrator) -> junta queries/actions e compõe UI
- componentes "presentational" -> sem fetch, sem regras, sem side effects
- hooks -> encapsulam estado e handlers (UI logic)
- services/use-cases -> regras de negócio e decisões
- mappers -> transformar DTO <-> ViewModel

### Nomeação
- Componentes: PascalCase
- Hooks: useX
- Funções puras: camelCase
- Tipos: PascalCase; DTOs com sufixo Dto quando fizer sentido

### Client vs Server
- Preferir Server Components por defeito.
- Marcar "use client" APENAS quando:
  - há estado local, eventos, React Query, ou APIs do browser.
- Server Actions ficam em `features/<feature>/actions/*` e só são chamadas a partir do server OU via bridge segura (form action / wrapper).

---

## Server Actions (Next.js)
### Regras
- Validar input sempre com Zod.
- Nunca confiar no client.
- Retornar "result objects" previsíveis:
  { ok: true, data } | { ok: false, error: { code, message, fieldErrors? } }

### Estrutura padrão
- actions/<name>.action.ts:
  - schema de input
  - autorização
  - chamada ao service/use-case
  - return do result object

### Segurança e consistência
- Sempre verificar auth/roles no server.
- Nunca expor detalhes internos em mensagens de erro.
- Mapear erros para codes (ex: UNAUTHORIZED, VALIDATION, CONFLICT, UNKNOWN)

---

## React Query (useQuery/useMutation)
### Regras
- Centralizar queryKeys por feature.
- Um ficheiro por “resource”: queries/<resource>.queries.ts
- Nunca colocar string keys espalhadas pela UI.

### Padrão
- queryKeys.<feature>.<resource>.<scope>(params)
- hooks:
  - use<Resource>Query(params)
  - use<Resource>Mutation()

### Cache e invalidação
- Invalidation explícita após mutations.
- StaleTime e retry definidos conscientemente, não por acaso.

---

## TypeScript / Contracts
### Regras
- Criar tipos de fronteira:
  - Input types (forms)
  - DTO types (API/db)
  - ViewModel (UI)
- Converter via mappers/adapters (não misturar)
- Proibir "any". Preferir "unknown" + parse.

---

## Qualidade (checklist obrigatório antes de finalizar PR/commit)
- [ ] Componentes pequenos, sem responsabilidades múltiplas
- [ ] Sem lógica de negócio dentro de componentes presentational
- [ ] Server Actions validadas com Zod e com auth
- [ ] React Query keys centralizadas e invalidações corretas
- [ ] Tipos coerentes (DTO vs ViewModel)
- [ ] Pastas organizadas por feature
- [ ] Erros normalizados (result objects)
- [ ] Imports respeitam boundaries (shared não depende de feature)

---

## Comportamento do Agente (como deves agir em cada resposta)
1) Antes de codar: escrever mini-plano (3-7 bullets) com ficheiros a criar/alterar.
2) Se eu (utilizador) pedir “faz tudo num ficheiro”, recusar e aplicar modularização conforme limiares.
3) Quando encontrar ficheiro grande: propor refactor imediato e executar.
4) Sempre que existir ambiguidade de domínio: assumir a opção mais segura e consistente com o padrão.
5) Entregar código com:
   - nomes claros
   - comentários só quando há “porquê”, não “o quê”
   - exemplos de uso quando necessário

---

## Anti-patterns proibidos
- God components / God hooks
- Fetch + parsing + UI no mesmo componente
- “utils.ts” gigante
- Mutations sem invalidation
- Tipos duplicados em múltiplas camadas sem mapper
- Imports cruzados entre features

## Internal Rule Files

When applying this skill, always consult and follow
all documents located in the /rules directory.

Treat each file inside /rules as mandatory behavioral extensions.

END SKILL