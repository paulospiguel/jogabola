# SKILL: 🧭 Builder-Business

## ⚽ Visão Geral — Arena V2 (Gestão de Grupos Recreativos)

O **JogaBola Arena V2** foca em resolver o caos logístico de capitães e organizadores de grupos de futebol recreativo (amigos, bairro, trabalho) que atualmente dependem do WhatsApp. A solução centraliza convocações, confirmações, racha financeiro (pagamentos), multas e histórico em uma interface gamificada e eficiente.

## 🎯 Objetivos Estratégicos

1. **Substituir o Caos do WhatsApp**: Transformar conversas desestruturadas em processos de 1 clique (convocação e confirmação).
2. **Automação Financeira**: Eliminar erros em cálculos de "rachas" e facilitar a cobrança de multas e mensalidades.
3. **Transparência e Histórico**: Manter um registro permanente de presenças, gols e saúde financeira do grupo.
4. **Validação de Monetização**: Validar o plano Pro de €4,99/mês por grupo através de um paywall estratégico (semana 3).
5. **Engajamento Social**: Usar a "pressão social" positiva (notificações de dívidas e rankings) para manter os jogadores ativos na app.

---

## 👥 Público-Alvo & Roles

| Persona | Role (Schema) | Objetivo Principal |
| :--- | :--- | :--- |
| **Capitão / Organizador** | `MANAGER` | Gerir elenco, criar convocações, controlar o caixa e multas. |
| **Jogador (Atleta)** | `PLAYER` | Confirmar presença em 1 clique, acompanhar estatísticas e saldo. |

*Nota: Não utilizar roles FAN ou ORGANIZER no MVP.*

---

## 🧩 Módulos Core (Prioridade M1 -> M6)

### M1 — Group Module
- Gestão de grupos (Free: limite de 1 grupo | Pro: ilimitados).
- Convite via link único e gestão de membros (ativo/inativo).
- **Entidades**: `group`, `group_member`.

### M2 — Convocation Module
- Criação de convocações com data, hora, local e limite de jogadores.
- Confirmação de presença em 1 clique (link público/privado).
- Lista de espera automática.
- **Entidades**: `convocation`, `attendance`.

### M3 — History & Stats
- Histórico de convocações (Free: 30 dias | Pro: ilimitado).
- Ranking de presenças e registro de gols por jogo.

### M4 — Finance Module
- **Free**: Racha manual e marcação de pagamento.
- **Pro**: Racha automático (regras: `confirmed_pays` vs `present_pays`), gestão de Caixa do Grupo e Multas configuráveis (atraso, falta, cartões).
- **Entidades**: `financial_rule`, `transaction`, `group_cashbox`.

### M5 — Subscription Module
- Upgrade para Pro (€4,99/mês por grupo).
- Middleware de gate `requirePro(groupId)` nas Server Actions.
- Paywall fake inicial para validação de interesse.

### M6 — Rotation Module (Pro Only)
- Divisão automática de 3 equipas para rotação (estateless logic).

---

## 🧠 Arquitetura e Decisões Técnicas

- **Stack**: Next.js (App Router + Server Actions), Drizzle ORM, PostgreSQL (Neon), Better Auth v2.
- **UI System**: Arena V2 (Dark mode, Neon, Glassmorphism). Toda a UI nova deve residir em `(protected)/arena/`.
- **Internacionalização (i18n)**: Focar exclusivamente em **Português (pt)** para o MVP.
- **Notificações**: Web Push API ou `sendEmail` action. Sem SMS.
- **Pagamentos**: Sem gateway real (Stripe/Mbway) no MVP. O capitão marca manualmente como "pago".

---

## ⚖️ Regras de Negócio e Validação (Testes)

Ao implementar, os seguintes fluxos **devem** ser testados rigorosamente:
1. **Lógica Financeira**: Cálculos de racha (split), aplicação de multas e saldo do membro.
2. **Subscription Gate**: O middleware deve bloquear features Pro em grupos Free.
3. **Limites de Grupo**: Impedir criação de múltiplos grupos no plano Free.

---

## 🚫 Out of Scope (MVP)
- Gateways de pagamento reais.
- App mobile nativa (foco em Web responsiva).
- Integração Web3/Blockchain.
- Rankings entre grupos diferentes.

---

## 🔗 Referências
- [PRD Completo](.agent/skills/builder-business/references/prd.md)

---
**Autoria: JogaBola Foundation**
END SKILL

