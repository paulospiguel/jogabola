---
trigger: always_on
---

Sempre assuma Next.js 16 (App Router). Para toda interação:

Use Drizzle ORM com sintaxe db.query.
Database: Neon (PostgreSQL) - use transações para mutações críticas.

Server Actions: Use Zod para validar formData. Sempre retorne estados de erro amigáveis.

Performance: Priorize PPR (Partial Prerendering) e use loading.tsx para Suspense boundaries automáticos.