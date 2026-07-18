# Plano de Implementação MVP — JogaBola

Este plano detalha as tarefas necessárias para transformar o JogaBola numa plataforma que substitui o caos do WhatsApp, focando na identidade persistente, automação financeira e gamificação.

---

## 🟢 Fase 1: Identidade Global & "Utilizador Fantasma" (Fundação)
*Prioridade: Crítica. Necessária para persistência e pagamentos.*

- [x] **Refatorar `guest-rsvp.actions.ts`**:
    - [x] Implementar lógica de "Upsert Ghost User": se o email não existir na tabela `users`, criar um registo sem password.
    - [x] Atualizar `verifyGuestOTP` para associar o `attendance` ao `id` do utilizador (fantasma ou real).
- [x] **Sessão Persistente (Client-side)**:
    - [x] Criar hook `useGuestSession` para gerir identidade no `localStorage`.
    - [x] Implementar "Auto-reconhecimento": se o email no `localStorage` existir, a UI saúda o utilizador e pula o formulário de inscrição.
- [x] **Validação**:
    - [x] Inserir email como convidado -> Verificar se User foi criado na BD.
    - [x] Abrir novo evento com o mesmo email -> Verificar se o sistema pede PIN e recupera o nome.

---

## 🟡 Fase 2: Logística & Fluxo de Convocatória
*Prioridade: Alta. Resolve a "fricção" de criar jogos.*

- [x] **Templates & Clonagem**:
    - [x] Adicionar botão "Re-convocar Último Plantel" no `CreateEventSheet`.
    - [x] Implementar logicamente a cópia dos `invitedPlayers` do último evento da equipa.
- [x] **Gestão de Vagas**:
    - [x] Implementar regra de "Prioridade de Plantel": impedir convidados de se inscreverem se faltarem > X horas e houver membros do plantel pendentes.
- [x] **Validação**:
    - [x] Criar evento A -> Criar evento B -> Verificar se o plantel do A é sugerido/clonado corretamente.

---

## 🟠 Fase 3: Autonomia Financeira (O "Racha")
*Prioridade: Média-Alta. Substitui o controlo manual do Capitão.*

- [x] **Fluxo de Comprovativos**:
    - [x] Criar UI de upload de comprovativo para utilizadores não logados (Guests).
    - [x] Integrar com a tabela `payment_proofs`.
- [x] **Multas & Restrições**:
    - [x] Criar tabela/lógica para `Fines` associadas ao utilizador.
    - [x] Implementar "Bloqueio de Inscrição": impedir `Attendance` se houver `Fines` pendentes > 0.
- [x] **Validação**:
    - [x] Simular cancelamento tardio -> Verificar se multa é gerada.
    - [x] Tentar inscrever em novo jogo -> Verificar se o botão de confirmação está bloqueado.

---

## 🔵 Fase 4: Comunicação (O "Vício" - Parte I)
*Prioridade: Média. Retenção e engajamento.*

- [x] **Mural de Avisos**:
    - [x] Criar componente `EventNoticeWall` no topo do detalhe do evento.
    - [x] Lógica de avisos proativos do Capitão para a equipa.
- [ ] **Relatório de Jogo (Post-Match)** (Adiado):
    - [ ] Criar componente `PostMatchReportSheet` para o Capitão.
    - [ ] Implementar submissão de Golos, Assistências e MVP.
- [x] **Validação**:
    - [x] Capitão publica aviso -> Atletas visualizam instantaneamente no mural.

---

## 🛠️ Notas de Engenharia
- **Database**: Usar Drizzle ORM para todas as novas relações.
- **I18n**: Todas as novas strings devem ir para `pt.json`.
- **UI**: Manter prefixo `Jb` nos componentes e usar tokens de `design-tokens.css`.
