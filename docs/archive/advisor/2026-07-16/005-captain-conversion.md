# Plano 005: Reforçar confiança e conversão do capitão

> **Drift check:** `git diff --stat 2c1eb85..HEAD -- 'src/app/(public)/(website)' src/constants/app.ts src/locales`  
> Copy ou estrutura do hero divergente é STOP até revisão.

## Estado

- **Prioridade:** P1
- **Esforço:** M
- **Risco:** Baixo
- **Depende de:** 002, 004
- **Categoria:** direção/produto
- **Planeado em:** `2c1eb85`, 2026-07-16

## Porque importa

A proposta de valor é boa, mas a primeira dobra privilegia espetáculo visual sobre ação e a página contém sinais de pouca maturidade — links mortos, redes divergentes, PT-PT misturado com “pelada” e prova social não verificável. Para um capitão confiar pagamentos e dados do plantel, estes detalhes são decisivos.

## Âmbito

**Incluído:** `website/page.tsx`, `contact/page.tsx`, `pricing/page.tsx`, `roadmap/page.tsx`, `src/constants/app.ts`, quatro locales e testes puros de links/copy se existentes.  
**Excluído:** redesign total, design system Arena, novas redes sociais e novos eventos server-side.

## Passos

1. Em `src/app/(public)/(website)/page.tsx`, reduzir a altura do hero 25–35% em desktop e garantir promessa + CTA principal na primeira dobra a 900 px.
2. Usar **“jogo”** como vocabulário padrão PT-PT e remover “pelada” da experiência portuguesa. Adaptar cada um dos outros três locales com o equivalente natural, sem tradução literal forçada.
3. Migrar `contact/page.tsx` para `getTranslations`/`useTranslations`; usar `APP.SOCIAL`, remover Discord enquanto não houver URL real e eliminar todo o texto hardcoded.
4. Corrigir `Logo href="home"` para `/` em pricing e roadmap.
5. Remover ou marcar como demonstração qualquer testemunho/número sem fonte auditável.
6. Inventariar eventos existentes antes de instrumentar. Reutilizar `team_created` e `event_created` server-side já existentes e consent-gated pelo plano 002; adicionar apenas os eventos client-side ausentes `landing_cta_clicked` e `auth_started`, sem PII e após consentimento.

**Verificação:**

```bash
pnpm lint
pnpm ts-check
pnpm test
pnpm build
```

Browser: mobile 390×844 e desktop 1440×900; CTA visível, links válidos, sem overflow e sem warnings LCP novos.

## Critérios de conclusão

- [ ] Contactos e redes têm uma única fonte e nenhum `href="#"`/`href="home"`.
- [ ] Zero copy hardcoded nova; quatro locales sincronizados.
- [ ] Prova social verificável ou explicitamente demo.
- [ ] Funil medido sem executar analytics antes do consentimento.

## Test plan

- Criar `src/lib/__tests__/public-site-contract.test.ts`. Com `node:fs`, ler `contact/page.tsx`, `pricing/page.tsx`, `roadmap/page.tsx` e `pt.json`; afirmar ausência de `href="#"`, `href="home"` e “pelada”, e presença de import/uso de `APP.SOCIAL` no contacto.
- Executar `pnpm exec vitest run src/lib/__tests__/public-site-contract.test.ts`; esperado: testes falham antes das alterações e passam depois.
- Browser manual 390×844 e 1440×900 valida primeira dobra, menu, CTA e página de contacto.

## STOP

- Alegações/testemunhos não podem ser validados: remover, não inventar substitutos.

## Manutenção

Cada alegação pública deve ter owner/fonte; novos eventos têm de passar pelo consentimento central do plano 002.
