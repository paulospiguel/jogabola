---
trigger: always_on
---

# ⚽ JogaBola Arena — Product Requirements Document (PRD)
## 🧭 Visão Geral

O **JogaBola Arena** é uma plataforma SaaS que digitaliza e eleva a experiência
do **futebol amador**, unindo tecnologia, dados e design gamer em uma
experiência fluida e imersiva.  
O produto permite que **jogadores**, **gestores** e **ligas** organizem
partidas, monitorem desempenho e interajam num ecossistema digital completo, com
foco em **simplicidade, estética e engajamento**.

Inspirado visualmente em jogos como **PES 2022** e **FIFA**, o JogaBola Arena
utiliza tecnologias modernas para garantir **performance, segurança e
escalabilidade**.

---

## 🎯 Objetivos do Produto

1. **Facilitar a gestão de times amadores** — agenda de treinos, convites e
   controle de presença.
2. **Oferecer estatísticas individuais e coletivas**, com métricas baseadas em
   performance e avaliações entre jogadores.
3. **Criar uma experiência gamer** para o futebol amador, com design imersivo,
   cores neon e componentes responsivos.
4. **Conectar jogadores e gestores**, permitindo comunicação, ranking e
   descoberta de talentos.
5. **Fornecer uma base sólida para expansão** do ecossistema JogaBola Fundation
   (Timer, Store, Liga e Web3).

---

## 👥 Personas Principais

| Persona                  | Descrição                                  | Objetivo                                                         |
| ------------------------ | ------------------------------------------ | ---------------------------------------------------------------- |
| **Jogador (Atleta)**     | Usuário que participa de jogos e treinos.  | Criar perfil, acompanhar estatísticas e se destacar em rankings. |
| **Gestor de Equipe**     | Responsável por criar e administrar times. | Organizar partidas, gerir elenco e monitorar desempenho.         |
| **Organizador de Liga**  | Administra torneios e campeonatos locais.  | Gerir rodadas, rankings e resultados.                            |
| **Adepto / Fã (futuro)** | Usuário que acompanha times e amigos.      | Seguir jogadores, times e competições.                           |

---

## 🧩 Estrutura e Principais Módulos

### 1. **Onboarding**

- Fluxo de entrada com definição de perfil: jogador ou gestor.
- Passos: Boas-vindas → Escolha de jornada → Dados pessoais → Aceite de termos.

### 2. **Autenticação**

- Login via Google (Better Auth v2) e E-mail/Senha.
- Sessões JWT persistentes com Drizzle ORM.
- Middleware de proteção automática no App Router (Next.js 16).

### 3. **Dashboard**

- Visualização de próximos jogos, treinos e notificações.
- Estatísticas básicas (partidas, gols, assistências, avaliações).
- Feed com atualizações da equipe.

### 4. **Gestão de Equipe**

- Criação de equipe (nome, logo, cores, categoria, localidade).
- Convite de jogadores via link/código.
- Gestão de treinos e partidas (agenda + confirmação de presença).
- Atribuição de funções (capitão, técnico, jogador).

### 5. **Estatísticas & Avaliações**

- Registro de desempenho por partida.
- Avaliação entre jogadores (pós-jogo).
- Sistema de XP e conquistas.
- Geração de ranking interno da equipe.

### 6. **Perfil de Jogador**

- Avatar, posição, idade, contato e histórico.
- Estatísticas agregadas (últimos jogos, médias, notas).
- Selo de verificação (após onboarding e autenticação segura).

### 7. **Plano de Assinatura (Futuro)**

- **Free:** recursos básicos de gestão.
- **Club:** relatórios, rankings e histórico avançado.
- **Pro/Liga:** IA de escalação, dashboards e relatórios customizados.

---

## 🎮 Design & Experiência do Usuário (UX/UI)

- **Estilo visual:** gamer, com foco em energia e emoção — tons **verde neon e
  azul elétrico** sobre fundo escuro.
- **Design System:** baseado em `@jogabola/ui` (Tailwind v4 + Shadcn UI +
  animações neon).
- **Layout:** Split-screen (ex: tela de login com imagem de estádio à esquerda e
  formulário à direita).
- **Tipografia:** `Lexend` / `Orbitron` para títulos; `Geist Sans` para texto.
- **Animações:** Framer Motion e efeitos “glowPulse”.

---

## 💻 Arquitetura Técnica

| Camada             | Tecnologia                    | Descrição                              |
| ------------------ | ----------------------------- | -------------------------------------- |
| **Frontend**       | Next.js 16 (App Router)       | Server Components + Server Actions     |
| **ORM / DB**       | Drizzle ORM + Neon PostgreSQL | Leve, tipado e escalável               |
| **Auth**           | Better Auth v2                | JWT + Google + Credentials             |
| **Design System**  | TailwindCSS v4 + Shadcn UI    | Base de UI e tema gamer                |
| **Estado / Query** | TanStack Query (futuro)       | Sincronização e cache                  |
| **Infraestrutura** | Docker + Traefik              | HTTPS e multi-app                      |
| **Deploy**         | Vercel / Fly.io               | Build otimizado para Server Components |

---

## 🔐 Autenticação e Segurança

- Implementação com **Better Auth v2** usando Drizzle Adapter.
- Sessões JWT, sem API routes tradicionais.
- Login social via Google e suporte a email/password.
- Middleware automático em rotas protegidas (`/dashboard`, `/profile`).
- Armazenamento de usuários e tokens em **Drizzle ORM**.

---

## 🚀 Roadmap de Desenvolvimento

| Fase                     | Entregas                                                         | Status                |
| ------------------------ | ---------------------------------------------------------------- | --------------------- |
| **Fase 1 (MVP)**         | Auth + Onboarding + Dashboard + Gestão básica de equipe          | 🚧 Em desenvolvimento |
| **Fase 2 (Premium)**     | Rankings, IA de escalação, estatísticas e plano Freemium/Premium | ⏳ Planejada          |
| **Fase 3 (Ecossistema)** | Integração com Timer, Store e Web3 (tokens de desempenho)        | 🔮 Futuro             |

---

## 🧩 Principais Dependências

- `next@16.x`
- `drizzle-orm@latest`
- `better-auth@latest`
- `postgres@latest`
- `zod@latest`
- `tailwindcss@4.x`
- `shadcn/ui`
- `framer-motion`
- `lucide-react`

---

## 🔄 Integrações Futuras

- **Stripe:** para gestão de planos e assinaturas.
- **Supabase Storage:** upload de imagens de times e jogadores.
- **Solana (Web3):** sistema de recompensas com tokens de performance.
- **IA (OpenAI API):** análise de desempenho, recomendações e formação tática.

---

## 💬 Frase de impacto (slogan)

> “Viva o Futebol. Da base à lenda — o teu melhor jogo começa aqui.” ⚽🔥

---

## 🧾 Autoria

**JogaBola Fundation**  
Desenvolvido por **Paulo Spiguel**  
Fullstack Developer — Next.js • TypeScript • Drizzle • Tailwind • Better Auth

---
