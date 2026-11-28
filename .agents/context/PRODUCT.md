# Product

## Register

product

## Users

**Primary — Capitão / Organizador**
Amateur football team captain. Manages the group out of love for the sport and social glue, not obligation. Context: phone in hand between training sessions, at the field, in the WhatsApp thread that got too complex. Job: create events, confirm the lineup, chase payments, close the racha, record results. Needs speed and control. Friction kills motivation to keep organizing.

**Secondary — Atleta / Jogador**
Team member who shows up (or doesn't). Context: quick mobile glance before or after work. Job: confirm presence, pay their share, see how they're performing vs teammates. Engagement is passive; the product earns their attention through relevant, personalized data.

**Tertiary — Convidado**
One-off participant, brought by a regular. No account required. Identified by email. May become a full Atleta over time. Experience must be frictionless: confirm, pay, done.

## Product Purpose

JogaBola is the operational backbone for amateur football teams in Portugal — the tool that replaces the chaos of WhatsApp threads, spreadsheet rachas, and memory-based rosters. It handles convocatórias (match/training events), attendance tracking, payment splitting, stats, rankings, and seasonal history.

Success looks like: a Capitão who can create and close an event end-to-end in under two minutes, and an Atleta who opens the app once before the game and once after payment, and feels their team's history growing.

## Strategic Direction — AI Club OS

JogaBola is evolving from team-management software into the operational platform for amateur clubs and teams, with virtual AI staff embedded in useful workflows. AI supports the existing product; it is not a generic chatbot that replaces the team's tools or the organizer's judgement.

### First validated workflow

The first cycle focuses on a Secretary for a senior team. The coach or organizer asks for availability for a match. The Secretary prepares the request, interprets each athlete's response, and surfaces confirmations and unresolved answers. Start with synthetic data for two clubs. Measure time saved, duplicate requests, and manual corrections before expanding the pilot.

The human remains responsible for decisions and outbound communication. Clear replies can update attendance only through an authorized action. Ambiguous replies require clarification. The organizer reviews a message before it is sent to the squad.

### Business guardrails

- An AI staff member has its own identity and an explicit club/team scope; it never acts as the human who requested the task.
- Authorization is checked on the server for every read and action. A club's private data is not visible to another club.
- Each action is attributable, auditable, safe to retry, and subject to cost/token limits. Revocation blocks future actions; exhausted quotas block inference.
- Preserve existing recreational events, team history, and member workflows while adding clubs, seasons, and competitive fixtures incrementally.
- Validate the Secretary before expanding to an Analyst. Consider voice only after pilot evidence and an explicit consent/retention decision.

### Architecture direction

Build the first cycle in the existing Next.js, Drizzle, and PostgreSQL application, with local development through Docker Compose and server-side text inference through OpenRouter. Prefer a vertical slice over new infrastructure. Defer a hosted worker, voice, and vector database until measured requirements justify them. The active implementation sequence and acceptance criteria live in `docs/superpowers/plans/2026-11-25-ai-club-os.md`.

### Progressive plan model

Clubs and solo organizers start free and grow only when operational complexity justifies it:

- **Grátis (`free`)** — Entry tier for solo managers and casual groups replacing WhatsApp chaos (up to 3 teams, 25 athletes per team, 10 monthly events).
- **Básico (`basic`)** — Regular weekly teams needing payment proofs, pending reminders, and full season history.
- **Amador (`amateur`)** — Competitive amateur squads and small managers adding multiple teams, seasons, fixtures, and initial Secretary AI quota under human review.
- **Profissional (`pro`)** — Multi-team amateur clubs and academies requiring isolated club operations, expanded virtual staff quotas, and advanced seasonal reporting.
- **Campeão (`champion`)** — Custom contact-sales tier for larger clubs and organizations seeking bespoke limits, assisted onboarding, and exclusive capabilities.

## Brand Personality

**Três palavras:** Eficiente. Desportivo. Sólido.

Tone: direct, close, sporting. Imperative verbs in CTAs. Numbers over prose. The energy of a tool built by someone who plays, for people who play — not by a sports federation for compliance.

Emotional target: the Capitão opens the app and feels in control. Not overwhelmed by data, not patronized by a tutorial, not trapped in a form. Everything they need is one tap away. The Atleta opens it and feels the team's identity — their own stats, their crew's history, the next game on the horizon.

## Anti-references

- **Apps corporativas genéricas**: Salesforce, Monday, Jira. Soulless productivity UI. Grid tables, dense sidebars, no personality. JogaBola is a tool for athletes, not office workers.
- **Apps de futebol oficial**: UEFA, FPF, Liga apps. Overbuilt for federations, formal language, bureaucratic flows. JogaBola is for the Sunday league, not the Champions League.
- **WhatsApp / grupos de chat**: JogaBola must feel like a product with structure and real data, not a prettier group chat. Structure, hierarchy, and decision flows must be evident.

## Design Principles

1. **Capitão first.** Every screen and interaction is optimized for the person in charge. Decisions are one tap away. The Atleta experience is a simplified view of the same data, not a separate product.

2. **Velocidade sobre completude.** Quick actions beat comprehensive forms. Show the essential, offer the rest on demand. A Capitão creating an event should finish before they forget they started.

3. **Dados que significam algo.** Display results and history, not abstract metrics. "Vitória 3-1 vs Sporting FC" not "3 events completed." Numbers earn their size through meaning, not decoration.

4. **Desportivo mas sério.** The energy of real sport, not a cartoon game. No excessive gamification, no confetti for logging in. Badges and rankings exist because football is competitive — they serve the sport, not engagement loops.

5. **A equipa como identidade.** The team is the product's soul, not the individual user account. Surface team moments, collective history, and group dynamics. The individual sees themselves within the crew, not instead of it.

6. **Mobile-first, desktop-different.** The primary surface is a phone at a football pitch, not a browser at a desk. Every interaction is designed for one thumb, ambient noise, and 10-second attention spans. The desktop version is not a stretched mobile layout; it has its own density, sidebar navigation, and richer data views — but it never drives design decisions for shared features.

## Accessibility & Inclusion

- **Target:** WCAG AA compliance.
- **Motion:** Respect `prefers-reduced-motion`. All animations must degrade gracefully to instant transitions.
- **Color:** Never rely on color alone for state — always pair color with icon or text (e.g. confirmed status = green + checkmark + "Confirmado").
- **Touch targets:** Minimum 44×44px on mobile. Field conditions are not ideal; fat-finger tolerance is required.
- **Language:** PT-PT exclusively in UI. No English labels in user-facing strings.
