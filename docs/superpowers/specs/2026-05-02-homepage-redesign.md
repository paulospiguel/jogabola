# Homepage Redesign — Design Spec
**Date:** 2026-05-02  
**Branch:** releases/jogabola-teams/release01  
**Scope:** Public home page (`src/app/(public)/(website)/page.tsx`) + all 4 locale files

---

## Objective

Align the public landing page with the real product goal: a beta-stage weekly football game management tool for captains. Remove aspirational/fictional stats. Add waitlist CTA and sections that communicate problems solved and MVP features.

---

## Audience

- **Primary (v1):** Captains — organizers of weekly amateur football games who manage squad, attendance, and payments.
- **Secondary:** Players who want to join a team. Not addressed with specific features in v1, but the hero copy is inclusive.

---

## Tone

Hybrid: dark/tech aesthetic (scalable to semi-pro future) + warm, human language (recognizable to weekend organizers). Bold but not startup-jargony.

---

## Page Structure (5 sections)

```
1. Hero
2. Momentum Strip
3. Problems Section
4. Features MVP
5. Waitlist CTA
```

---

## Section 1 — Hero

**Keep:** dark football field background (`FieldPattern`), animated `DashboardCard` on the right.

**Changes:**
- Badge: replace version badge with pulsing green beta badge (matching `/waitlist` page style, `#7CFF4F`)
- Headline (4 lines):
  - Line 1: "O teu jogo semanal,"
  - Line 2: "organizado."
  - Line 3: "Sem grupos de WhatsApp." (highlight color: blue-500)
  - Line 4: "Sem confusão."
- Subheadline: "Gerencia equipas, presenças e pagamentos num só lugar. Para capitães que levam o jogo a sério."
- Primary CTA: "Entrar na lista de espera" → `/waitlist` (green `#7CFF4F` bg, black text)
- Remove "Watch Demo" button (VIDEO_ID is still a placeholder)

**i18n keys affected:** `homePage.hero.*`

| Key | PT | EN | ES | FR |
|-----|----|----|----|----|
| `badge` | `BETA · Acesso Antecipado` | `BETA · Early Access` | `BETA · Acceso Anticipado` | `BETA · Accès Anticipé` |
| `titlePart1` | `O teu jogo semanal,` | `Your weekly game,` | `Tu partido semanal,` | `Ton match hebdomadaire,` |
| `titlePart2` | `organizado.` | `organised.` | `organizado.` | `organisé.` |
| `titleHighlight` | `Sem grupos de WhatsApp.` | `No WhatsApp groups.` | `Sin grupos de WhatsApp.` | `Sans groupes WhatsApp.` |
| `titlePart3` | `Sem confusão.` | `No chaos.` | `Sin caos.` | `Sans chaos.` |
| `description` | `Gerencia equipas, presenças e pagamentos num só lugar. Para capitães que levam o jogo a sério.` | `Manage squads, attendance and payments in one place. For captains who take the game seriously.` | `Gestiona equipos, asistencias y pagos en un solo lugar. Para capitanes que se toman el juego en serio.` | `Gérez équipes, présences et paiements en un seul endroit. Pour les capitaines qui prennent le jeu au sérieux.` |
| `joinWaitlist` | `Entrar na lista de espera` | `Join the waitlist` | `Unirse a la lista de espera` | `Rejoindre la liste d'attente` |

---

## Section 2 — Momentum Strip

**Replaces:** `StatsSection` (remove fake numbers entirely).

**Design:** 3 static items in a horizontal row. Thin top/bottom borders (`border-white/5`). Dark background (`bg-slate-950`). Each item: large icon + bold short phrase.

```
⚽  Jogo marcado       ✓  14 confirmados       💳  Pagamentos a dia
```

No numbers. No claims. Just recognizable football-captain moments.

**i18n keys:** `homePage.momentumStrip.*`

| Key | PT | EN | ES | FR |
|-----|----|----|----|----|
| `item1` | `Jogo marcado` | `Game scheduled` | `Partido marcado` | `Match programmé` |
| `item2` | `14 confirmados` | `14 confirmed` | `14 confirmados` | `14 confirmés` |
| `item3` | `Pagamentos a dia` | `Payments up to date` | `Pagos al día` | `Paiements à jour` |

---

## Section 3 — Problems Section

**New section.** Background: `bg-slate-900`. 3 cards in a row (stacked on mobile).

Each card:
- Custom image via `next/image` (see asset paths below), max height ~80px, `object-contain`
- Pain title (bold, white)
- Pain description (1–2 lines, gray-400)
- Resolution line (blue-400, small, with arrow)

**Asset paths:**
| Card | File |
|------|------|
| Pain 1 — Attendance | `src/assets/images/jb-confused-cap.png` |
| Pain 2 — Payments | `src/assets/images/jb-money.png` |
| Pain 3 — Proofs | `src/assets/images/jb-receipts.png` |

```
Card 1                          Card 2                          Card 3
[jb-confused-cap.png]           [jb-money.png]                  [jb-receipts.png]
"Quem vem ao jogo?"             "Já toda gente pagou?"          "Onde está o comprovativo?"
Confirmações perdidas no        Perseguir jogadores por          Imagens enterradas no grupo.
WhatsApp. Nunca sabes           transferência semana após        Impossível validar sem
quem aparece.                   semana.                          perder tempo.
→ Lista de presenças            → Registo por jogador            → Upload e pré-validação
  em tempo real
```

Section title: "Reconheces isto?" (kicker above: "O PROBLEMA")

**i18n keys:** `homePage.problems.*`

| Key | PT | EN | ES | FR |
|-----|----|----|----|----|
| `kicker` | `O PROBLEMA` | `THE PROBLEM` | `EL PROBLEMA` | `LE PROBLÈME` |
| `title` | `Reconheces isto?` | `Sound familiar?` | `¿Te suena esto?` | `Ça te parle ?` |
| `pain1.title` | `"Quem vem ao jogo?"` | `"Who's coming to the game?"` | `"¿Quién viene al partido?"` | `"Qui vient au match ?"` |
| `pain1.description` | `Confirmações perdidas no WhatsApp. Nunca sabes quem aparece.` | `Confirmations lost in WhatsApp. You never know who'll show up.` | `Confirmaciones perdidas en WhatsApp. Nunca sabes quién aparece.` | `Confirmations perdues dans WhatsApp. On ne sait jamais qui viendra.` |
| `pain1.resolution` | `Lista de presenças em tempo real` | `Real-time attendance list` | `Lista de asistencia en tiempo real` | `Liste de présence en temps réel` |
| `pain2.title` | `"Já toda gente pagou?"` | `"Has everyone paid?"` | `"¿Ya pagó todo el mundo?"` | `"Tout le monde a payé ?"` |
| `pain2.description` | `Perseguir jogadores por transferência semana após semana.` | `Chasing players for transfers week after week.` | `Persiguiendo jugadores por transferencias semana tras semana.` | `Courir après les joueurs pour les virements, semaine après semaine.` |
| `pain2.resolution` | `Registo de pagamentos por jogador` | `Per-player payment tracking` | `Registro de pagos por jugador` | `Suivi des paiements par joueur` |
| `pain3.title` | `"Onde está o comprovativo?"` | `"Where's the proof of payment?"` | `"¿Dónde está el comprobante?"` | `"Où est le justificatif ?"` |
| `pain3.description` | `Imagens enterradas no grupo. Impossível validar sem perder tempo.` | `Images buried in the group chat. Impossible to validate without wasting time.` | `Imágenes enterradas en el grupo. Imposible validar sin perder tiempo.` | `Images noyées dans le groupe. Impossible à valider sans perdre du temps.` |
| `pain3.resolution` | `Upload e pré-validação automática` | `Upload and automatic pre-validation` | `Subida y prevalidación automática` | `Upload et pré-validation automatique` |

---

## Section 4 — Features MVP

**Replaces:** `EcosystemSection` (keep card layout, update copy and remove "Explorar" buttons).

**Changes:**
- Add kicker badge above grid: `MVP · O ESSENCIAL`
- Title: "Tudo o que precisas para gerir o teu jogo semanal"
- Subtitle: "Sem módulos a mais. Sem curva de aprendizagem. Começas hoje."
- Remove "Explorar →" button from each card (no destination yet)
- Rewrite card copy to benefit-oriented language:

| Module | Title (PT) | Description (PT) |
|--------|-----------|-----------------|
| Teams | `Equipas e Plantel` | `Sabe sempre quem está no teu plantel e quem convidas para o próximo jogo.` |
| Attendance | `Presenças e Lista de Espera` | `Lista de confirmados, reservas e fila de espera automática. Sem WhatsApp.` |
| Payments | `Pagamentos MBWay` | `Regista quem pagou, quem está pendente e valores em atraso, sem stress.` |
| Proofs | `Comprovativos` | `Jogadores enviam o comprovativo. Tu validas. Tudo num só lugar.` |

**i18n keys affected:** `homePage.ecosystem_section.*` (update existing keys)

| Key | PT | EN | ES | FR |
|-----|----|----|----|----|
| `kicker` | `MVP · O ESSENCIAL` | `MVP · THE ESSENTIALS` | `MVP · LO ESENCIAL` | `MVP · L'ESSENTIEL` |
| `title` | `Tudo o que precisas para gerir o teu jogo semanal` | `Everything you need to manage your weekly game` | `Todo lo que necesitas para gestionar tu partido semanal` | `Tout ce qu'il faut pour gérer ton match hebdomadaire` |
| `subtitle` | `Sem módulos a mais. Sem curva de aprendizagem. Começas hoje.` | `No extra modules. No learning curve. Start today.` | `Sin módulos extra. Sin curva de aprendizaje. Empiezas hoy.` | `Pas de modules en trop. Pas de courbe d'apprentissage. Tu commences aujourd'hui.` |
| `modules.teams.title` | `Equipas e Plantel` | `Squads and Roster` | `Equipos y Plantilla` | `Équipes et Effectif` |
| `modules.teams.description` | `Sabe sempre quem está no teu plantel e quem convidas para o próximo jogo.` | `Always know who's in your squad and who you're inviting for the next game.` | `Sabe siempre quién está en tu plantilla y a quién invitas para el próximo partido.` | `Sache toujours qui est dans ton effectif et qui tu invites pour le prochain match.` |
| `modules.attendance.title` | `Presenças e Lista de Espera` | `Attendance and Waiting List` | `Asistencias y Lista de Espera` | `Présences et Liste d'Attente` |
| `modules.attendance.description` | `Lista de confirmados, reservas e fila de espera automática. Sem WhatsApp.` | `Confirmed list, reserves and automatic waiting list. No WhatsApp needed.` | `Lista de confirmados, reservas y cola de espera automática. Sin WhatsApp.` | `Liste des confirmés, réservations et file d'attente automatique. Sans WhatsApp.` |
| `modules.payments.title` | `Pagamentos MBWay` | `MBWay Payments` | `Pagos MBWay` | `Paiements MBWay` |
| `modules.payments.description` | `Regista quem pagou, quem está pendente e valores em atraso, sem stress.` | `Track who paid, who's pending and overdue amounts, stress-free.` | `Registra quién pagó, quién está pendiente y los importes vencidos, sin estrés.` | `Enregistre qui a payé, qui est en attente et les montants en retard, sans stress.` |
| `modules.proofs.title` | `Comprovativos` | `Payment Proofs` | `Comprobantes` | `Justificatifs` |
| `modules.proofs.description` | `Jogadores enviam o comprovativo. Tu validas. Tudo num só lugar.` | `Players send the proof. You validate. All in one place.` | `Los jugadores envían el comprobante. Tú validas. Todo en un solo lugar.` | `Les joueurs envoient le justificatif. Tu valides. Tout au même endroit.` |

---

## Section 5 — Waitlist CTA

**New section.** High-contrast closing section.

**Design:**
- Background: `bg-slate-900` with subtle green glow `#7CFF4F/5` blur
- Pulsing green badge: `ACESSO ANTECIPADO`
- Headline (2 lines): "Sê dos primeiros a / organizar o teu jogo com o Jogabola."
- Subtext: "Estamos em beta. Lista de espera aberta."
- CTA button: green `#7CFF4F`, black text, "Entrar na lista de espera →" → `/waitlist`
- Discrete link below: "Já tens acesso? Entrar" → `/auth`

**i18n keys:** `homePage.waitlistCta.*`

| Key | PT | EN | ES | FR |
|-----|----|----|----|----|
| `badge` | `ACESSO ANTECIPADO` | `EARLY ACCESS` | `ACCESO ANTICIPADO` | `ACCÈS ANTICIPÉ` |
| `titlePart1` | `Sê dos primeiros a` | `Be among the first to` | `Sé de los primeros en` | `Sois parmi les premiers à` |
| `titlePart2` | `organizar o teu jogo com o Jogabola.` | `organise your game with Jogabola.` | `organizar tu partido con Jogabola.` | `organiser ton match avec Jogabola.` |
| `subtitle` | `Estamos em beta. Lista de espera aberta.` | `We're in beta. Waitlist is open.` | `Estamos en beta. Lista de espera abierta.` | `Nous sommes en bêta. Liste d'attente ouverte.` |
| `cta` | `Entrar na lista de espera` | `Join the waitlist` | `Unirse a la lista de espera` | `Rejoindre la liste d'attente` |
| `alreadyHaveAccess` | `Já tens acesso?` | `Already have access?` | `¿Ya tienes acceso?` | `Tu as déjà accès ?` |
| `signIn` | `Entrar` | `Sign in` | `Entrar` | `Se connecter` |

---

## Files to Change

| File | Change |
|------|--------|
| `src/app/(public)/(website)/page.tsx` | Full rewrite of Home component with 5 new sections |
| `src/locales/pt.json` | Add/update `homePage.hero`, add `homePage.momentumStrip`, `homePage.problems`, `homePage.waitlistCta`; update `homePage.ecosystem_section` |
| `src/locales/en.json` | Same keys as PT |
| `src/locales/es.json` | Same keys as PT |
| `src/locales/fr.json` | Same keys as PT |

---

## Components

All inline in `page.tsx` (existing pattern). No new component files needed. New sub-components:
- `MomentumStrip` (replaces `StatsSection`)
- `ProblemsSection` (new)
- `WaitlistCtaSection` (new)

Existing components to modify:
- `HeroSection` — new copy, new CTA, remove VideoPreviewModal
- `EcosystemSection` — update copy, remove Explorar buttons, update kicker/title/subtitle

---

## Out of Scope

- Actual waitlist form (already exists at `/waitlist`)
- Video demo (placeholder VIDEO_ID not ready)
- Player-facing features section (v2)
- Mobile nav changes
