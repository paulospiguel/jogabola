# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the public home page (`/`) with 5 sections: Hero, Momentum Strip, Problems, Features MVP, and Waitlist CTA — replacing fictional stats and generic copy with honest beta messaging aligned to the real product.

**Architecture:** All sections are inline React components in a single `page.tsx` (existing pattern). No new files. 4 locale files updated with new/updated i18n keys. Local asset images imported statically via `next/image`.

**Tech Stack:** Next.js 15 App Router, `next-intl` (i18n), `framer-motion` (animations), `next/image` (local assets), Tailwind CSS, `lucide-react` (icons), shadcn/ui Button.

---

## File Map

| File | Action |
|------|--------|
| `src/app/(public)/(website)/page.tsx` | Full rewrite — 5 new/updated section components |
| `src/locales/pt.json` | Update `homePage.hero.*`, update `homePage.ecosystem_section.*`, add `homePage.momentumStrip.*`, `homePage.problems.*`, `homePage.waitlistCta.*` |
| `src/locales/en.json` | Same as PT |
| `src/locales/es.json` | Same as PT |
| `src/locales/fr.json` | Same as PT |

---

## Task 1: Update locale files — new i18n keys

**Files:**
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Update `homePage.hero` in all 4 locale files**

In `src/locales/pt.json`, find the `"hero"` key inside `"homePage"` and replace its contents:
```json
"hero": {
  "badge": "BETA · Acesso Antecipado",
  "titlePart1": "O teu jogo semanal,",
  "titlePart2": "organizado.",
  "titleHighlight": "Sem grupos de WhatsApp.",
  "titlePart3": "Sem confusão.",
  "description": "Gerencia equipas, presenças e pagamentos num só lugar. Para capitães que levam o jogo a sério.",
  "joinWaitlist": "Entrar na lista de espera"
}
```

In `src/locales/en.json`:
```json
"hero": {
  "badge": "BETA · Early Access",
  "titlePart1": "Your weekly game,",
  "titlePart2": "organised.",
  "titleHighlight": "No WhatsApp groups.",
  "titlePart3": "No chaos.",
  "description": "Manage squads, attendance and payments in one place. For captains who take the game seriously.",
  "joinWaitlist": "Join the waitlist"
}
```

In `src/locales/es.json`:
```json
"hero": {
  "badge": "BETA · Acceso Anticipado",
  "titlePart1": "Tu partido semanal,",
  "titlePart2": "organizado.",
  "titleHighlight": "Sin grupos de WhatsApp.",
  "titlePart3": "Sin caos.",
  "description": "Gestiona equipos, asistencias y pagos en un solo lugar. Para capitanes que se toman el juego en serio.",
  "joinWaitlist": "Unirse a la lista de espera"
}
```

In `src/locales/fr.json`:
```json
"hero": {
  "badge": "BETA · Accès Anticipé",
  "titlePart1": "Ton match hebdomadaire,",
  "titlePart2": "organisé.",
  "titleHighlight": "Sans groupes WhatsApp.",
  "titlePart3": "Sans chaos.",
  "description": "Gérez équipes, présences et paiements en un seul endroit. Pour les capitaines qui prennent le jeu au sérieux.",
  "joinWaitlist": "Rejoindre la liste d'attente"
}
```

- [ ] **Step 2: Add `homePage.momentumStrip` to all 4 locale files**

Add this block inside `"homePage"` (after `"hero"`) in each file:

`pt.json`:
```json
"momentumStrip": {
  "item1": "Jogo marcado",
  "item2": "14 confirmados",
  "item3": "Pagamentos a dia"
}
```

`en.json`:
```json
"momentumStrip": {
  "item1": "Game scheduled",
  "item2": "14 confirmed",
  "item3": "Payments up to date"
}
```

`es.json`:
```json
"momentumStrip": {
  "item1": "Partido marcado",
  "item2": "14 confirmados",
  "item3": "Pagos al día"
}
```

`fr.json`:
```json
"momentumStrip": {
  "item1": "Match programmé",
  "item2": "14 confirmés",
  "item3": "Paiements à jour"
}
```

- [ ] **Step 3: Add `homePage.problems` to all 4 locale files**

`pt.json`:
```json
"problems": {
  "kicker": "O PROBLEMA",
  "title": "Reconheces isto?",
  "pain1": {
    "title": "\"Quem vem ao jogo?\"",
    "description": "Confirmações perdidas no WhatsApp. Nunca sabes quem aparece.",
    "resolution": "Lista de presenças em tempo real"
  },
  "pain2": {
    "title": "\"Já toda gente pagou?\"",
    "description": "Perseguir jogadores por transferência semana após semana.",
    "resolution": "Registo de pagamentos por jogador"
  },
  "pain3": {
    "title": "\"Onde está o comprovativo?\"",
    "description": "Imagens enterradas no grupo. Impossível validar sem perder tempo.",
    "resolution": "Upload e pré-validação automática"
  }
}
```

`en.json`:
```json
"problems": {
  "kicker": "THE PROBLEM",
  "title": "Sound familiar?",
  "pain1": {
    "title": "\"Who's coming to the game?\"",
    "description": "Confirmations lost in WhatsApp. You never know who'll show up.",
    "resolution": "Real-time attendance list"
  },
  "pain2": {
    "title": "\"Has everyone paid?\"",
    "description": "Chasing players for transfers week after week.",
    "resolution": "Per-player payment tracking"
  },
  "pain3": {
    "title": "\"Where's the proof of payment?\"",
    "description": "Images buried in the group chat. Impossible to validate without wasting time.",
    "resolution": "Upload and automatic pre-validation"
  }
}
```

`es.json`:
```json
"problems": {
  "kicker": "EL PROBLEMA",
  "title": "¿Te suena esto?",
  "pain1": {
    "title": "\"¿Quién viene al partido?\"",
    "description": "Confirmaciones perdidas en WhatsApp. Nunca sabes quién aparece.",
    "resolution": "Lista de asistencia en tiempo real"
  },
  "pain2": {
    "title": "\"¿Ya pagó todo el mundo?\"",
    "description": "Persiguiendo jugadores por transferencias semana tras semana.",
    "resolution": "Registro de pagos por jugador"
  },
  "pain3": {
    "title": "\"¿Dónde está el comprobante?\"",
    "description": "Imágenes enterradas en el grupo. Imposible validar sin perder tiempo.",
    "resolution": "Subida y prevalidación automática"
  }
}
```

`fr.json`:
```json
"problems": {
  "kicker": "LE PROBLÈME",
  "title": "Ça te parle ?",
  "pain1": {
    "title": "\"Qui vient au match ?\"",
    "description": "Confirmations perdues dans WhatsApp. On ne sait jamais qui viendra.",
    "resolution": "Liste de présence en temps réel"
  },
  "pain2": {
    "title": "\"Tout le monde a payé ?\"",
    "description": "Courir après les joueurs pour les virements, semaine après semaine.",
    "resolution": "Suivi des paiements par joueur"
  },
  "pain3": {
    "title": "\"Où est le justificatif ?\"",
    "description": "Images noyées dans le groupe. Impossible à valider sans perdre du temps.",
    "resolution": "Upload et pré-validation automatique"
  }
}
```

- [ ] **Step 4: Update `homePage.ecosystem_section` in all 4 locale files**

`pt.json` — replace the entire `"ecosystem_section"` block:
```json
"ecosystem_section": {
  "kicker": "MVP · O ESSENCIAL",
  "title": "Tudo o que precisas para gerir o teu jogo semanal",
  "subtitle": "Sem módulos a mais. Sem curva de aprendizagem. Começas hoje.",
  "modules": {
    "teams": {
      "title": "Equipas e Plantel",
      "description": "Sabe sempre quem está no teu plantel e quem convidas para o próximo jogo."
    },
    "attendance": {
      "title": "Presenças e Lista de Espera",
      "description": "Lista de confirmados, reservas e fila de espera automática. Sem WhatsApp."
    },
    "payments": {
      "title": "Pagamentos Integrados",
      "description": "Regista quem pagou, quem está pendente e valores em atraso, sem stress."
    },
    "proofs": {
      "title": "Comprovativos",
      "description": "Jogadores enviam o comprovativo. Tu validas. Tudo num só lugar."
    }
  }
}
```

`en.json`:
```json
"ecosystem_section": {
  "kicker": "MVP · THE ESSENTIALS",
  "title": "Everything you need to manage your weekly game",
  "subtitle": "No extra modules. No learning curve. Start today.",
  "modules": {
    "teams": {
      "title": "Squads and Roster",
      "description": "Always know who's in your squad and who you're inviting for the next game."
    },
    "attendance": {
      "title": "Attendance and Waiting List",
      "description": "Confirmed list, reserves and automatic waiting list. No WhatsApp needed."
    },
    "payments": {
      "title": "Integrated Payments",
      "description": "Track who paid, who's pending and overdue amounts, stress-free."
    },
    "proofs": {
      "title": "Payment Proofs",
      "description": "Players send the proof. You validate. All in one place."
    }
  }
}
```

`es.json`:
```json
"ecosystem_section": {
  "kicker": "MVP · LO ESENCIAL",
  "title": "Todo lo que necesitas para gestionar tu partido semanal",
  "subtitle": "Sin módulos extra. Sin curva de aprendizaje. Empiezas hoy.",
  "modules": {
    "teams": {
      "title": "Equipos y Plantilla",
      "description": "Sabe siempre quién está en tu plantilla y a quién invitas para el próximo partido."
    },
    "attendance": {
      "title": "Asistencias y Lista de Espera",
      "description": "Lista de confirmados, reservas y cola de espera automática. Sin WhatsApp."
    },
    "payments": {
      "title": "Pagos Integrados",
      "description": "Registra quién pagó, quién está pendiente y los importes vencidos, sin estrés."
    },
    "proofs": {
      "title": "Comprobantes",
      "description": "Los jugadores envían el comprobante. Tú validas. Todo en un solo lugar."
    }
  }
}
```

`fr.json`:
```json
"ecosystem_section": {
  "kicker": "MVP · L'ESSENTIEL",
  "title": "Tout ce qu'il faut pour gérer ton match hebdomadaire",
  "subtitle": "Pas de modules en trop. Pas de courbe d'apprentissage. Tu commences aujourd'hui.",
  "modules": {
    "teams": {
      "title": "Équipes et Effectif",
      "description": "Sache toujours qui est dans ton effectif et qui tu invites pour le prochain match."
    },
    "attendance": {
      "title": "Présences et Liste d'Attente",
      "description": "Liste des confirmés, réservations et file d'attente automatique. Sans WhatsApp."
    },
    "payments": {
      "title": "Paiements Integrados",
      "description": "Enregistre qui a payé, qui est en attente et les montants en retard, sans stress."
    },
    "proofs": {
      "title": "Justificatifs",
      "description": "Les joueurs envoient le justificatif. Tu valides. Tout au même endroit."
    }
  }
}
```

- [ ] **Step 5: Add `homePage.waitlistCta` to all 4 locale files**

`pt.json`:
```json
"waitlistCta": {
  "badge": "ACESSO ANTECIPADO",
  "titlePart1": "Sê dos primeiros a",
  "titlePart2": "organizar o teu jogo com o Jogabola.",
  "subtitle": "Estamos em beta. Lista de espera aberta.",
  "cta": "Entrar na lista de espera",
  "alreadyHaveAccess": "Já tens acesso?",
  "signIn": "Entrar"
}
```

`en.json`:
```json
"waitlistCta": {
  "badge": "EARLY ACCESS",
  "titlePart1": "Be among the first to",
  "titlePart2": "organise your game with Jogabola.",
  "subtitle": "We're in beta. Waitlist is open.",
  "cta": "Join the waitlist",
  "alreadyHaveAccess": "Already have access?",
  "signIn": "Sign in"
}
```

`es.json`:
```json
"waitlistCta": {
  "badge": "ACCESO ANTICIPADO",
  "titlePart1": "Sé de los primeros en",
  "titlePart2": "organizar tu partido con Jogabola.",
  "subtitle": "Estamos en beta. Lista de espera abierta.",
  "cta": "Unirse a la lista de espera",
  "alreadyHaveAccess": "¿Ya tienes acceso?",
  "signIn": "Entrar"
}
```

`fr.json`:
```json
"waitlistCta": {
  "badge": "ACCÈS ANTICIPÉ",
  "titlePart1": "Sois parmi les premiers à",
  "titlePart2": "organiser ton match avec Jogabola.",
  "subtitle": "Nous sommes en bêta. Liste d'attente ouverte.",
  "cta": "Rejoindre la liste d'attente",
  "alreadyHaveAccess": "Tu as déjà accès ?",
  "signIn": "Se connecter"
}
```

- [ ] **Step 6: Verify build compiles with no errors**

```bash
cd /Users/paulospiguel/devSpace/sLabs/jogabola-workspace/jogabola
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "feat(i18n): add homepage redesign translation keys across all locales"
```

---

## Task 2: Rewrite HeroSection

**Files:**
- Modify: `src/app/(public)/(website)/page.tsx`

The current `HeroSection` uses `useJourneyRedirect` (redirects to `/auth`) and renders a `VideoPreviewModal`. Both are replaced.

- [ ] **Step 1: Replace HeroSection in `page.tsx`**

Remove the `VideoPreviewModal` component and the `useJourneyRedirect` import. Replace `HeroSection` with:

```tsx
const HeroSection = () => {
  const t = useTranslations("homePage.hero");

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-slate-950 pt-20">
      <FieldPattern />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center rounded-full border border-[#7CFF4F]/20 bg-[#7CFF4F]/10 px-4 py-1.5">
              <div className="mr-2 h-2 w-2 animate-pulse rounded-full bg-[#7CFF4F]" />
              <span className="text-xs font-bold tracking-widest text-[#7CFF4F] uppercase">
                {t("badge")}
              </span>
            </div>

            <h1 className="text-5xl font-extrabold leading-tight text-white md:text-6xl lg:text-7xl">
              {t("titlePart1")}
              <br />
              {t("titlePart2")}
              <br />
              <span className="text-blue-500">{t("titleHighlight")}</span>
              <br />
              {t("titlePart3")}
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-gray-400 md:text-xl">
              {t("description")}
            </p>

            <div className="pt-4">
              <Button
                asChild
                className="rounded-full px-8 py-7 text-lg font-bold shadow-xl transition-all hover:scale-105"
                style={{ backgroundColor: "#7CFF4F", color: "#000" }}
              >
                <Link href="/waitlist">
                  {t("joinWaitlist")}
                </Link>
              </Button>
            </div>
          </motion.div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-20 rounded-full bg-blue-500/10 blur-[100px]" />
            <DashboardCard />
          </div>
        </div>
      </div>
    </section>
  );
};
```

Also add `Link` to imports at the top of the file:
```tsx
import Link from "next/link";
```

Remove from imports: `Play`, `Star` (no longer used in Hero or Stats).

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/\(website\)/page.tsx
git commit -m "feat(home): rewrite HeroSection — beta badge, new copy, waitlist CTA"
```

---

## Task 3: Replace StatsSection with MomentumStrip

**Files:**
- Modify: `src/app/(public)/(website)/page.tsx`

Remove `StatsSection` entirely. Remove `DASHBOARD_BARS` constant (still used by `DashboardCard` — keep it). Remove `webConfig` import if `HOME_STATS` was its only use.

- [ ] **Step 1: Check if `webConfig` is used elsewhere in `page.tsx`**

Search for all uses of `webConfig` in the file. If the only use was `webConfig.HOME_STATS` inside `StatsSection`, remove the import.

- [ ] **Step 2: Add MomentumStrip component**

Add after `DashboardCard` component, before `HeroSection`:

```tsx
const MomentumStrip = () => {
  const t = useTranslations("homePage.momentumStrip");

  const items = [
    { icon: <span className="text-2xl">⚽</span>, label: t("item1") },
    { icon: <CheckCircle2 className="h-6 w-6 text-[#7CFF4F]" />, label: t("item2") },
    { icon: <CreditCard className="h-6 w-6 text-blue-400" />, label: t("item3") },
  ];

  return (
    <div className="border-t border-b border-white/5 bg-slate-950 py-6">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.icon}
              <span className="text-base font-bold text-white">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/\(website\)/page.tsx
git commit -m "feat(home): replace StatsSection with MomentumStrip — remove fake numbers"
```

---

## Task 4: Add ProblemsSection

**Files:**
- Modify: `src/app/(public)/(website)/page.tsx`

Uses `next/image` with static imports from `src/assets/images/`.

- [ ] **Step 1: Add static image imports at top of `page.tsx`**

```tsx
import Image from "next/image";
import confusedCapImg from "@/assets/images/jb-confused-cap.png";
import moneyImg from "@/assets/images/jb-money.png";
import receiptsImg from "@/assets/images/jb-receipts.png";
```

- [ ] **Step 2: Add ProblemsSection component**

Add after `MomentumStrip`, before `HeroSection`:

```tsx
const ProblemsSection = () => {
  const t = useTranslations("homePage.problems");

  const pains = [
    {
      image: confusedCapImg,
      alt: "confused captain",
      title: t("pain1.title"),
      description: t("pain1.description"),
      resolution: t("pain1.resolution"),
    },
    {
      image: moneyImg,
      alt: "money payment",
      title: t("pain2.title"),
      description: t("pain2.description"),
      resolution: t("pain2.resolution"),
    },
    {
      image: receiptsImg,
      alt: "payment receipts",
      title: t("pain3.title"),
      description: t("pain3.description"),
      resolution: t("pain3.resolution"),
    },
  ];

  return (
    <section className="bg-slate-900 py-24">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-bold tracking-widest text-blue-500 uppercase">
            {t("kicker")}
          </p>
          <h2 className="text-4xl font-extrabold text-white md:text-5xl">
            {t("title")}
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {pains.map((pain, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="flex flex-col rounded-3xl border border-white/5 bg-white/5 p-8"
            >
              <div className="mb-6 flex h-20 items-center">
                <Image
                  src={pain.image}
                  alt={pain.alt}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h3 className="mb-3 text-lg font-bold text-white">{pain.title}</h3>
              <p className="mb-6 flex-1 text-sm leading-relaxed text-gray-400">
                {pain.description}
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                <ArrowRight className="h-3 w-3 shrink-0" />
                {pain.resolution}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/\(website\)/page.tsx
git commit -m "feat(home): add ProblemsSection with jb custom images and pain point copy"
```

---

## Task 5: Update EcosystemSection (Features MVP)

**Files:**
- Modify: `src/app/(public)/(website)/page.tsx`

Remove the "Explorar →" Button from each card. Update kicker, title, subtitle. Copy is already updated in locales (Task 1).

- [ ] **Step 1: Replace EcosystemSection**

Find and replace the entire `EcosystemSection` component with:

```tsx
const EcosystemSection = () => {
  const t = useTranslations("homePage.ecosystem_section");

  const modules = [
    { icon: Users, title: t("modules.teams.title"), description: t("modules.teams.description") },
    { icon: CheckCircle2, title: t("modules.attendance.title"), description: t("modules.attendance.description") },
    { icon: CreditCard, title: t("modules.payments.title"), description: t("modules.payments.description") },
    { icon: FileCheck2, title: t("modules.proofs.title"), description: t("modules.proofs.description") },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-32">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-emerald-600/5 blur-[120px]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 md:px-6">
        <div className="mb-20 text-center">
          <h2 className="mb-4 text-sm font-bold tracking-widest text-blue-500 uppercase">
            {t("kicker")}
          </h2>
          <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-extrabold text-white md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {modules.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md transition-all hover:border-white/10 hover:bg-white/10"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 transition-transform group-hover:scale-110">
                <module.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-4 text-xl font-bold text-white">{module.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{module.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/\(website\)/page.tsx
git commit -m "feat(home): update EcosystemSection — benefit copy, remove Explorar buttons"
```

---

## Task 6: Add WaitlistCtaSection + wire up Home

**Files:**
- Modify: `src/app/(public)/(website)/page.tsx`

- [ ] **Step 1: Add WaitlistCtaSection component**

Add after `EcosystemSection`:

```tsx
const WaitlistCtaSection = () => {
  const t = useTranslations("homePage.waitlistCta");

  return (
    <section className="relative overflow-hidden bg-slate-900 py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7CFF4F]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-2xl px-4 text-center md:px-6">
        <div className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#7CFF4F]/20 bg-[#7CFF4F]/10 px-4 py-1.5 text-xs font-bold tracking-widest text-[#7CFF4F] uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7CFF4F]" />
            {t("badge")}
          </span>
        </div>

        <h2 className="mb-4 text-4xl font-extrabold text-white md:text-5xl">
          {t("titlePart1")}
          <br />
          {t("titlePart2")}
        </h2>

        <p className="mb-10 text-lg text-gray-400">{t("subtitle")}</p>

        <Button
          asChild
          className="rounded-full px-10 py-7 text-lg font-bold shadow-xl transition-all hover:scale-105"
          style={{ backgroundColor: "#7CFF4F", color: "#000" }}
        >
          <Link href="/waitlist">{t("cta")}</Link>
        </Button>

        <p className="mt-6 text-sm text-white/30">
          {t("alreadyHaveAccess")}{" "}
          <Link href="/auth" className="text-white/50 underline underline-offset-2 transition-colors hover:text-white/70">
            {t("signIn")}
          </Link>
        </p>
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Update the `Home` export to include all 5 sections**

Replace the `export default function Home()` at the bottom:

```tsx
export default function Home() {
  return (
    <main className="relative bg-slate-950">
      <HeroSection />
      <MomentumStrip />
      <ProblemsSection />
      <EcosystemSection />
      <WaitlistCtaSection />
    </main>
  );
}
```

- [ ] **Step 3: Clean up unused imports**

Remove any imports that are no longer referenced:
- `Play` (removed with VideoPreviewModal)
- `Star` (removed with StatsSection)
- `useRef` (removed with VideoPreviewModal)
- `Modal` and `ModalRef` (removed with VideoPreviewModal)
- `webConfig` (removed with StatsSection — only if not used elsewhere)
- `useJourneyRedirect` (removed with Hero rewrite)

Verify only these imports remain from lucide-react: `ArrowRight`, `CheckCircle2`, `CreditCard`, `FileCheck2`, `Users`.

- [ ] **Step 4: Full build check**

```bash
npx tsc --noEmit && npx next build 2>&1 | tail -20
```
Expected: build completes with no type errors. Warnings about bundle size are acceptable.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(public\)/\(website\)/page.tsx
git commit -m "feat(home): add WaitlistCtaSection and wire up all 5 homepage sections"
```

---

## Self-Review

**Spec coverage:**
- ✅ Section 1 Hero: Task 2 — new badge, copy, green CTA, removed VideoPreviewModal
- ✅ Section 2 Momentum Strip: Task 3 — replaces StatsSection, 3 static items
- ✅ Section 3 Problems: Task 4 — 3 cards with jb images, pain+resolution copy
- ✅ Section 4 Features MVP: Task 5 — updated copy, removed Explorar buttons
- ✅ Section 5 Waitlist CTA: Task 6 — green badge, headline, CTA → /waitlist, sign-in link
- ✅ All 4 locales: Task 1 — PT/EN/ES/FR keys for all new and updated sections
- ✅ `next/image` for local assets: Task 4 Step 1

**Placeholder scan:** No TBDs. All code blocks complete. All i18n strings written out in full for all 4 locales.

**Type consistency:**
- `confusedCapImg`, `moneyImg`, `receiptsImg` — imported in Task 4 Step 1, used in Task 4 Step 2 ✅
- `MomentumStrip` — defined Task 3, used in Task 6 Step 2 ✅
- `ProblemsSection` — defined Task 4, used in Task 6 Step 2 ✅
- `WaitlistCtaSection` — defined Task 6 Step 1, used in Task 6 Step 2 ✅
- Lucide imports: `CheckCircle2`, `CreditCard` used in MomentumStrip (Task 3) AND EcosystemSection (Task 5) — both are already imported ✅
- `ArrowRight` used in ProblemsSection (Task 4) — already imported ✅
