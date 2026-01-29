# PRD — JogaBola Arena (SaaS) — Futebol Amador

**Documento:** Product Requirements Document (PRD)  
**Produto:** JogaBola Arena  
**Modelo:** Freemium (Free → Club → Pro/Liga)  
**Plataforma (fase actual):** WebApp (Next.js 16)  
**Identidade visual:** experiência “game-like” (inspiração PES 2022), dark com
tons **verde neon** e **azul eléctrico**.

---

## 1) Contexto e Problema

O futebol amador tem elevada recorrência (treinos e jogos semanais), mas é
gerido com ferramentas dispersas (WhatsApp, folhas, apps genéricas). Isso gera:

- Falhas de comunicação (convites, presenças, horários);
- Pouca consistência na recolha de estatísticas;
- Zero “progressão” e motivação contínua do atleta;
- Baixa retenção/engajamento entre jogos.

O **JogaBola Arena** resolve isto com um hub central
(jogador/gestor/liga/árbitro), foco em organização, insights e gamificação leve.

---

## 2) Visão do Produto

O **JogaBola Arena** é um SaaS que transforma a gestão e a experiência do
futebol amador numa jornada digital moderna:

- **Organização** (agenda, presenças, convites);
- **Performance** (estatísticas e avaliações pós-jogo);
- **Engajamento** (notificações e progressão);
- **Confiança** (validação de resultados com **árbitro** quando aplicável);
- **Identidade** (UI imersiva estilo videojogo).

---

## 3) Objetivos

### 3.1 Objetivos de Negócio

- Validar crescimento e retenção com Freemium;
- Converter equipas activas para **Club** e ligas para **Pro/Liga**;
- Sustentar custos (DB, storage, envio de e-mail, push) com limites e upsell.

### 3.2 Objetivos de Produto

- Fazer do **Arena (Hub do Jogador)** a porta de entrada diária;
- Aumentar taxa de confirmação de presenças;
- Aumentar taxa de avaliações pós-jogo (para alimentar métricas futuras/IA);
- Melhorar credibilidade de resultados e disciplina com **jornada de árbitro**.

### 3.3 Objetivos Técnicos

- Arquitetura moderna com **Server Actions**, autenticação sólida (Better Auth)
  e ORM leve (Drizzle);
- Preparar base para multi-tenant e planos (Stripe) sem refactor grande.

---

## 4) Personas e Jornadas

### 4.1 Personas

- **Jogador (Atleta):** quer jogos, evolução, reconhecimento e simplicidade.
- **Gestor de Equipa:** quer agenda, presenças, convites, organização rápida.
- **Organizador de Liga:** quer calendário, resultados, ranking, consistência.
- **Árbitro:** quer agenda de jogos, confirmação de presença, registo rápido e
  validado de ocorrências.

### 4.2 Jornadas (alto nível)

- **Jogador:** Onboarding → Login → **Arena** → Confirmar presença → Jogar →
  Avaliar colegas → Ver ranking/estatísticas.
- **Gestor:** Onboarding → Login → Painel da Equipa → Criar/Agendar → Convidar →
  Confirmar presenças → Registar resultado → Pedir avaliações.
- **Liga (MVP futuro):** Criar liga → Criar calendário → Recolher resultados →
  Ranking.
- **Árbitro:** Onboarding → Verificação mínima → Receber convites/escala →
  Confirmar presença → **Painel do Árbitro** → Registar resultado e ocorrências
  → Submeter súmula → Encerrar jogo.

---

## 5) Proposta de Valor (por persona)

- **Jogador:** “Vejo o meu progresso, recebo lembretes e ganho reconhecimento.”
- **Gestor:** “Organizo o time em minutos: agenda, convites, presenças e stats.”
- **Liga:** “Padronizo campeonatos e automatizo rankings e comunicação.”
- **Árbitro:** “Tenho um painel simples para gerir jogos, registar ocorrências e
  validar resultados com confiança.”

---

## 6) Escopo por Fase

### 6.1 MVP (Core)

**Foco:** autenticação, onboarding e experiência base.

**Inclui:**

- Onboarding (perguntas estratégicas + escolha de jornada);
- Login (Google + opcional Email/Senha);
- **Arena (Hub do Jogador)**;
- Equipas: criar/entrar via convite/código (mínimo);
- Agenda: registo de jogos/treinos + presença;
- Registo simples de resultado (gestor) + pedido de avaliação (pós-jogo).

**Árbitro no MVP (mínimo viável):**

- Perfil de árbitro (role);
- Receber convite/escala para um jogo;
- Confirmar presença;
- Registar **resultado final** (simples) e submeter.

### 6.2 MVP+ (Crítico para Engajamento)

**Inclui:**

- **Push notifications Web (PWA)**: convites, lembretes e presença;
- **E-mails transacionais**: convites, lembretes, confirmação, avaliação
  pós-jogo;
- Centro de notificações in-app;
- Limites Freemium aplicados + UX de upgrade.

**Árbitro no MVP+:**

- Painel do Árbitro (agenda + próximos jogos);
- Registo de ocorrências básicas:
  - cartões (amarelo/vermelho),
  - golos (por equipa),
  - notas rápidas (incidentes);
- “Súmula” simples (resumo final do jogo) e submissão.

### 6.3 Fase 2 (Premium)

- Estatísticas avançadas, dashboards e exportação;
- Ranking mais robusto, conquistas e desafios;
- Stripe (assinaturas), gestão de plano por tenant;
- Árbitro: validação avançada e workflows (protestos, relatórios, anexos).

### 6.4 Fase 3 (Ecossistema)

- Liga avançada (tabela, calendário, arbitragens);
- Integração Timer;
- Web3 / recompensas (se e quando fizer sentido).

---

## 7) Requisitos Funcionais

### 7.1 Onboarding (pré-auth e pós-auth)

**Requisitos:**

- Perguntas para definir perfil e personalização mínima:
  - Jornada: Jogador / Gestor / **Árbitro** (Liga futuro);
  - Posição (jogador), experiência (árbitro), localização (cidade/raio);
  - Preferência de notificações (push/email);
  - Aceite de termos.
- Guardar respostas para personalizar a experiência.

**Critérios de aceitação:**

- O utilizador termina o fluxo e é encaminhado para login.
- Após login, entra na área certa conforme role.

### 7.2 Autenticação

**Requisitos:**

- Login social Google (obrigatório);
- Email/Senha (opcional);
- Sessões seguras e persistentes;
- Rotas protegidas (middleware).

### 7.3 Arena (Hub do Jogador)

_(mantém-se conforme versão anterior do PRD)_

### 7.4 Gestão de Equipa (mínimo viável)

_(mantém-se)_

### 7.5 Agenda: Jogos e Treinos

_(mantém-se)_

### 7.6 Avaliações pós-jogo

_(mantém-se)_

### 7.7 Jornada do Árbitro

#### 7.7.1 Escala/Convite para jogo

**Requisitos:**

- Um gestor/liga pode convidar um árbitro para um jogo.
- Árbitro recebe notificação (push/email no MVP+).
- Árbitro confirma disponibilidade: **Aceitar / Recusar**.

**Critérios de aceitação:**

- Aceitar coloca o jogo na agenda do árbitro.
- Recusar notifica o gestor e permite convidar outro árbitro.

#### 7.7.2 Painel do Árbitro (página “coração” do árbitro)

**Conteúdo:**

- Próximos jogos (data/hora/local);
- Estado (confirmado/pendente);
- Acesso rápido ao “Registo do jogo”;
- Pendências (submeter súmula, validar resultado).

**Critérios de aceitação:**

- Em 15 segundos, o árbitro entende o próximo compromisso e pendências.

#### 7.7.3 Registo do jogo (ocorrências)

**MVP (mínimo):**

- Inserir/confirmar resultado final.

**MVP+:**

- Registar:
  - golos (por equipa),
  - cartões (amarelo/vermelho),
  - notas rápidas (incidente, atraso, comportamento).
- Gerar “súmula” simples (resumo) e submeter.

**Critérios de aceitação:**

- Submissão bloqueia alterações sem “reabrir” (apenas liga/admin pode reabrir no
  futuro).
- Gestor e jogadores recebem notificação do resultado submetido.

#### 7.7.4 Validação do resultado

**Requisitos:**

- Se houver árbitro confirmado, o resultado “oficial” é o submetido pelo
  árbitro.
- Se não houver árbitro, o resultado é “não verificado” (gestor submete e equipa
  confirma).

**Critérios de aceitação:**

- UI deve indicar claramente: `Verificado pelo árbitro` vs `Não verificado`.

---

## 8) Multi-tenant (Requisitos e Regras)

_(mantém-se)_

---

## 9) Freemium: Limites (anti-abuso) e Upgrade UX

### 9.1 Limites recomendados (Free)

- **Equipas por tenant:** 1
- **Jogadores activos por equipa:** 15
- **Eventos por mês (jogos/treinos):** 8
- **Convites pendentes:** 10
- **Gestores adicionais:** 1 (além do owner)

**Árbitro (limite Free sugerido):**

- **Jogos arbitrados/mês:** 8 (Free)
- **Súmulas com detalhes:** limitado (MVP+: apenas texto curto)
- Upgrade para arbitragem “Pro” (futuro) quando houver marketplace de árbitros.

---

## 10) Requisitos Não Funcionais (RNFs)

_(mantém-se)_

---

## 11) Métricas (KPIs) e Eventos

### 11.1 KPIs adicionais (Árbitro)

- % jogos com árbitro confirmado
- Tempo médio para submissão de súmula
- % jogos “verificados” vs “não verificados”
- Taxa de aceitação de convites de arbitragem

### 11.2 Eventos de tracking (adicionais)

- `referee_invited`
- `referee_accepted`
- `referee_declined`
- `match_report_submitted`
- `match_verified`

---

## 12) Dependências e Integrações

_(mantém-se; push/email cruciais no MVP+)_

---

## 13) Riscos e Mitigações (Árbitro)

- **Conflitos de resultado (gestor vs árbitro):** regra de “resultado oficial” +
  logs e auditoria.
- **Arbitragem em iOS web push limitada:** e-mail + in-app center como fallback.
- **Fraude/abuso:** rate limit convites e validação de identidade do árbitro
  (fase 2).

---

## 14) Fora de Escopo (por agora)

_(mantém-se; inclui marketplace de árbitros como fase futura)_

---

## 15) Definição de “Pronto” (MVP → MVP+)

### MVP pronto quando:

- Roles Jogador/Gestor/Árbitro conseguem autenticar e acessar seus hubs;
- Árbitro pode aceitar convite e submeter resultado final;
- Arena e agenda funcionam no básico.

### MVP+ pronto quando:

- Push web e e-mails transacionais activos para convites + lembretes +
  avaliações;
- Painel do Árbitro com registo de ocorrências e submissão de súmula;
- Centro de notificações in-app;
- Limites Free aplicados e UX de upgrade clara.

---
