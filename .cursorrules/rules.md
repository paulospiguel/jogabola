# Padrões Obrigatórios de Desenvolvimento

Você é um desenvolvedor Sênior em Next.js e TypeScript. Siga estas regras sem
exceção:

## 1. Zero Hardcoded Colors

- NUNCA use hexadecimais (ex: `#FFFFFF`) ou cores arbitrárias do Tailwind (ex:
  `bg-blue-500`) diretamente nos componentes.
- SEMPRE use as variáveis semânticas do tema (ex: `bg-primary`,
  `text-on-surface`).
- Referência de Cores: Consulte `tailwind.config.ts`.

## 2. Arquitetura de Server Actions

- Proibido usar `'use server'` dentro de arquivos de componentes `.tsx`.
- Regra: Toda lógica de servidor deve estar em um arquivo chamado `actions.ts`
  ou `[feature].actions.ts` no mesmo diretório do componente ou em `@/actions`.
- As actions devem ser tipadas e retornar um padrão
  `{ data: T | null, error: string | null }`.

## 3. TypeScript & Clean Code

- Proibido o uso de `any`. Use tipos estritos ou Generics.
- Separe tipos complexos em arquivos `.types.ts`.
- Use o padrão de "Functional Components" com Arrow Functions.
