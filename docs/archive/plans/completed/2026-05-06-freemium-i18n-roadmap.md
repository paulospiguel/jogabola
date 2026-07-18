# Freemium, i18n Audit, Roadmap Page & UI Cleanup

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all hardcoded strings in the athlete event view, enforce freemium team limits (max 3 free), build the plan infrastructure for pro/elite tiers, add a public roadmap page linked from the footer, and remove the redundant "Convidar atletas" block from the shared event view.

**Architecture:** Five independent subsystems touched in dependency order: (1) UI cleanup, (2) i18n string extraction, (3) freemium constants + DB column + action guard, (4) roadmap page, (5) footer link. The freemium layer is schema-first: add `plan_tier` to the `user` table, derive limits from a constants file, enforce in the server action.

**Tech Stack:** Next.js 16 App Router, next-intl (4 locales: pt/en/es/fr), Drizzle ORM + PostgreSQL, `pnpm db:generate && pnpm db:push` for migrations, shadcn/ui + arena design tokens.

---

## File Map

| Action | Path |
|--------|------|
| Modify | `src/app/(public)/(athlete)/event/[id]/_components/athlete-event-detail.tsx` |
| Modify | `src/app/(public)/(athlete)/event/[id]/_components/athlete-rsvp-sheet.tsx` |
| Modify | `src/components/arena/edit-event-sheet.tsx` |
| Modify | `src/locales/pt.json` |
| Modify | `src/locales/en.json` |
| Modify | `src/locales/es.json` |
| Modify | `src/locales/fr.json` |
| Create | `src/constants/plans.ts` |
| Modify | `src/db/schema/users.ts` |
| Modify | `src/actions/teams.actions.ts` |
| Modify | `src/components/arena/create-team-sheet.tsx` |
| Create | `src/app/(public)/(website)/roadmap/page.tsx` |
| Modify | `src/components/footer.tsx` |

---

## Task 1: Remove "Convidar atletas" ShareBar from athlete event view

The `ShareBar` component renders inside the `tab === "lista"` section of `athlete-event-detail.tsx` (line 441). The top header already has a share button (`EventHeader`), making this redundant. Remove only the `<ShareBar>` render call and the `ShareBar` function itself. The `ShareBar` function is defined inside the same file — remove it too.

**Files:**
- Modify: `src/app/(public)/(athlete)/event/[id]/_components/athlete-event-detail.tsx`

- [ ] **Step 1: Remove the ShareBar function (lines ~188-258)**

Delete the entire `function ShareBar(...)` block from `athlete-event-detail.tsx`. It starts at the line `function ShareBar({` and ends at the closing `}` before `export function AthleteEventDetail`.

Also remove the now-unused imports: `LinkIcon`, `SendIcon` from `@animateicons/react/lucide`.

- [ ] **Step 2: Remove the ShareBar render call**

In the `tab === "lista"` section, remove:
```tsx
<ShareBar eventId={event.id} eventTitle={event.title} />
```
(was on line ~441 inside `{tab === "lista" && ( <div className="px-4 py-4">`)

- [ ] **Step 3: Verify no TypeScript errors**

```bash
cd /Users/paulospiguel/devSpace/sLabs/jogabola-workspace/jogabola && pnpm tsc --noEmit 2>&1 | grep "athlete-event-detail"
```
Expected: no output (no errors).

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/\(athlete\)/event/\[id\]/_components/athlete-event-detail.tsx
git commit -m "feat: remove redundant ShareBar from athlete event view (share icon in header already covers this)"
```

---

## Task 2: i18n — athlete-event-detail.tsx hardcoded strings

This file uses `useTranslations` is not imported at all. It has ~15 hardcoded Portuguese strings. We introduce a new locale namespace `athleteEventPublic`.

**Files:**
- Modify: `src/app/(public)/(athlete)/event/[id]/_components/athlete-event-detail.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Add `athleteEventPublic` to pt.json**

Add this object at the root level of `src/locales/pt.json` (before the closing `}`):

```json
"athleteEventPublic": {
  "back": "Voltar",
  "share": "Partilhar",
  "copied": "Copiado!",
  "status": {
    "scheduled": "Agendado",
    "ongoing": "A Decorrer",
    "completed": "Concluído",
    "cancelled": "Cancelado"
  },
  "countdown": "CONTAGEM DECRESCENTE",
  "filledSlots": "Vagas preenchidas",
  "slotsFull": "Vagas esgotadas — podes entrar na lista de espera",
  "confirmed": "Confirmados",
  "waitingList": "Lista de espera",
  "noOneConfirmed": "Ainda ninguém confirmou. Sê o primeiro!",
  "loading": "A carregar...",
  "notes": "Notas",
  "presenceConfirmed": "Presença confirmada!",
  "greetingWithName": "Olá, {name}",
  "onConfirmedList": "Estás na lista confirmada",
  "joinWaitlist": "Entrar na lista de espera",
  "confirmPresence": "Confirmar presença",
  "cancelPresence": "Cancelar presença",
  "hasAccount": "Tens conta Jogabola? Entra para gerir a tua presença.",
  "login": "Entrar",
  "register": "Criar conta",
  "tabs": {
    "squad": "Convocados",
    "location": "Local"
  },
  "type": {
    "game": "Jogo Oficial",
    "training": "Treino"
  },
  "price": {
    "free": "Grátis"
  }
}
```

- [ ] **Step 2: Add `athleteEventPublic` to en.json**

Add at root level of `src/locales/en.json`:

```json
"athleteEventPublic": {
  "back": "Back",
  "share": "Share",
  "copied": "Copied!",
  "status": {
    "scheduled": "Scheduled",
    "ongoing": "Ongoing",
    "completed": "Completed",
    "cancelled": "Cancelled"
  },
  "countdown": "COUNTDOWN",
  "filledSlots": "Slots filled",
  "slotsFull": "Slots full — you can join the waiting list",
  "confirmed": "Confirmed",
  "waitingList": "Waiting list",
  "noOneConfirmed": "No one confirmed yet. Be the first!",
  "loading": "Loading...",
  "notes": "Notes",
  "presenceConfirmed": "Attendance confirmed!",
  "greetingWithName": "Hi, {name}",
  "onConfirmedList": "You are on the confirmed list",
  "joinWaitlist": "Join waiting list",
  "confirmPresence": "Confirm attendance",
  "cancelPresence": "Cancel attendance",
  "hasAccount": "Have a Jogabola account? Sign in to manage your attendance.",
  "login": "Sign in",
  "register": "Create account",
  "tabs": {
    "squad": "Squad",
    "location": "Location"
  },
  "type": {
    "game": "Official Match",
    "training": "Training"
  },
  "price": {
    "free": "Free"
  }
}
```

- [ ] **Step 3: Add `athleteEventPublic` to es.json**

Add at root level of `src/locales/es.json`:

```json
"athleteEventPublic": {
  "back": "Volver",
  "share": "Compartir",
  "copied": "Copiado!",
  "status": {
    "scheduled": "Programado",
    "ongoing": "En curso",
    "completed": "Completado",
    "cancelled": "Cancelado"
  },
  "countdown": "CUENTA REGRESIVA",
  "filledSlots": "Plazas ocupadas",
  "slotsFull": "Plazas agotadas — puedes unirte a la lista de espera",
  "confirmed": "Confirmados",
  "waitingList": "Lista de espera",
  "noOneConfirmed": "Nadie ha confirmado aún. ¡Sé el primero!",
  "loading": "Cargando...",
  "notes": "Notas",
  "presenceConfirmed": "¡Asistencia confirmada!",
  "greetingWithName": "Hola, {name}",
  "onConfirmedList": "Estás en la lista confirmada",
  "joinWaitlist": "Unirse a la lista de espera",
  "confirmPresence": "Confirmar asistencia",
  "cancelPresence": "Cancelar asistencia",
  "hasAccount": "¿Tienes cuenta en Jogabola? Inicia sesión para gestionar tu asistencia.",
  "login": "Iniciar sesión",
  "register": "Crear cuenta",
  "tabs": {
    "squad": "Convocados",
    "location": "Lugar"
  },
  "type": {
    "game": "Partido Oficial",
    "training": "Entrenamiento"
  },
  "price": {
    "free": "Gratis"
  }
}
```

- [ ] **Step 4: Add `athleteEventPublic` to fr.json**

Add at root level of `src/locales/fr.json`:

```json
"athleteEventPublic": {
  "back": "Retour",
  "share": "Partager",
  "copied": "Copié!",
  "status": {
    "scheduled": "Prévu",
    "ongoing": "En cours",
    "completed": "Terminé",
    "cancelled": "Annulé"
  },
  "countdown": "COMPTE À REBOURS",
  "filledSlots": "Places remplies",
  "slotsFull": "Places épuisées — vous pouvez rejoindre la liste d'attente",
  "confirmed": "Confirmés",
  "waitingList": "Liste d'attente",
  "noOneConfirmed": "Personne n'a encore confirmé. Soyez le premier !",
  "loading": "Chargement...",
  "notes": "Notes",
  "presenceConfirmed": "Présence confirmée !",
  "greetingWithName": "Bonjour, {name}",
  "onConfirmedList": "Vous êtes sur la liste confirmée",
  "joinWaitlist": "Rejoindre la liste d'attente",
  "confirmPresence": "Confirmer la présence",
  "cancelPresence": "Annuler la présence",
  "hasAccount": "Vous avez un compte Jogabola ? Connectez-vous pour gérer votre présence.",
  "login": "Se connecter",
  "register": "Créer un compte",
  "tabs": {
    "squad": "Convoqués",
    "location": "Lieu"
  },
  "type": {
    "game": "Match Officiel",
    "training": "Entraînement"
  },
  "price": {
    "free": "Gratuit"
  }
}
```

- [ ] **Step 5: Refactor athlete-event-detail.tsx to use translations**

Replace the entire file content with the translated version. Key changes:
1. Add `import { useTranslations } from "next-intl";` 
2. Add `const t = useTranslations("athleteEventPublic");` inside `AthleteEventDetail`
3. Pass `t` as a prop or use it via a shared hook where needed in sub-components within the file

Because `StatusBadge`, `AttendanceBar`, and `EventHeader` are local functions in the same file, the simplest approach is to move `t` as a parameter or use `useTranslations` directly in each function.

Replace the top of `athlete-event-detail.tsx` (imports + StatusBadge + AttendanceBar + EventHeader):

```tsx
"use client";

import {
  CheckIcon,
  ShareIcon,
  XIcon,
} from "@animateicons/react/lucide";
import { ArrowLeft, Banknote, Calendar, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  cancelUserAttendance,
  confirmUserAttendance,
} from "@/actions/attendance.actions";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { JbBadge } from "@/components/arena/jb-badge";
import { LocationMap } from "@/components/arena/location-map";
import { Logo } from "@/components/logo";
import { useEventAttendance } from "@/hooks/use-event-attendance";
import { cn } from "@/lib/utils";
import { AthleteRsvpSheet } from "./athlete-rsvp-sheet";
import { CountdownTimer } from "./countdown-timer";
```

Replace `EventHeader` function:

```tsx
function EventHeader({ eventTitle, t }: { eventTitle: string; t: ReturnType<typeof useTranslations> }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: eventTitle, url });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-arena-border bg-arena-bg/90 px-4 backdrop-blur-md">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex size-9 items-center justify-center rounded-xl text-arena-text-muted transition-colors hover:bg-arena-surface hover:text-arena-text"
        aria-label={t("back")}
      >
        <ArrowLeft size={20} />
      </button>

      <Logo href="/" size="mini" variant="white" className="opacity-80" />

      <button
        type="button"
        onClick={handleShare}
        className="flex size-9 items-center justify-center rounded-xl text-arena-text-muted transition-colors hover:bg-arena-surface hover:text-arena-text"
        aria-label={t("share")}
      >
        {copied ? (
          <CheckIcon size={18} color="var(--color-arena-primary)" />
        ) : (
          <ShareIcon size={18} color="currentColor" />
        )}
      </button>
    </header>
  );
}
```

Replace `StatusBadge` function:

```tsx
function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useTranslations> }) {
  const map: Record<string, { key: keyof typeof statusKeys; color: string }> = {
    scheduled: {
      key: "scheduled",
      color: "text-arena-info border-arena-info/30 bg-arena-info/10",
    },
    ongoing: {
      key: "ongoing",
      color: "text-arena-success border-arena-success/30 bg-arena-success/10",
    },
    completed: {
      key: "completed",
      color: "text-arena-text-muted border-arena-border bg-arena-surface",
    },
    cancelled: {
      key: "cancelled",
      color: "text-arena-danger border-arena-danger/30 bg-arena-danger/10",
    },
  };
  const statusKeys = { scheduled: true, ongoing: true, completed: true, cancelled: true };
  const s = map[status] ?? map.scheduled;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        s.color,
      )}
    >
      {t(`status.${s.key}`)}
    </span>
  );
}
```

Replace `AttendanceBar` function:

```tsx
function AttendanceBar({
  confirmed,
  total,
  t,
}: {
  confirmed: number;
  total: number;
  t: ReturnType<typeof useTranslations>;
}) {
  const pct = Math.min((confirmed / total) * 100, 100);
  const isFull = confirmed >= total;

  return (
    <div className="rounded-[14px] border border-arena-border bg-arena-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold text-arena-text-sec">
          {t("filledSlots")}
        </span>
        <span className="text-[13px] font-bold text-arena-text">
          <span className={isFull ? "text-arena-danger" : "text-arena-success"}>
            {confirmed}
          </span>{" "}
          / {total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-arena-border">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isFull ? "bg-arena-danger" : "bg-arena-success",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isFull && (
        <p className="mt-2 text-center text-[11px] font-semibold text-arena-danger">
          {t("slotsFull")}
        </p>
      )}
    </div>
  );
}
```

In `AthleteEventDetail`, add `const t = useTranslations("athleteEventPublic");` and pass `t` to sub-components. Replace hardcoded strings:

- `<EventHeader eventTitle={event.title} />` → `<EventHeader eventTitle={event.title} t={t} />`
- `<StatusBadge status={event.status} />` → `<StatusBadge status={event.status} t={t} />`
- `<AttendanceBar confirmed={confirmed.length} total={total} />` → `<AttendanceBar confirmed={confirmed.length} total={total} t={t} />`
- `{isJogo ? "Jogo Oficial" : "Treino"}` → `{isJogo ? t("type.game") : t("type.training")}`
- `"CONTAGEM DECRESCENTE"` → `{t("countdown")}`
- `event.priceCents > 0 ? ...` price label's `"Grátis"` → `t("price.free")`
- Tabs `{ id: "lista", label: "Convocados" }, { id: "local", label: "Local" }` → `{ id: "lista", label: t("tabs.squad") }, { id: "local", label: t("tabs.location") }`
- `"A carregar..."` → `{t("loading")}`
- `"Confirmados"` span → `{t("confirmed")}`
- `"Ainda ninguém confirmou. Sê o primeiro!"` → `{t("noOneConfirmed")}`
- `"Lista de espera"` → `{t("waitingList")}`
- `"Presença confirmada!"` → `{t("presenceConfirmed")}`
- `userName ? \`Olá, ${userName}\` : "Estás na lista confirmada"` → `userName ? t("greetingWithName", { name: userName }) : t("onConfirmedList")`
- `"Cancelar presença"` → `{t("cancelPresence")}`
- `"Entrar na lista de espera"` → `{t("joinWaitlist")}`
- `"Confirmar presença"` → `{t("confirmPresence")}`
- `"Tens conta Jogabola? Entra para gerir a tua presença."` → `{t("hasAccount")}`
- `"Entrar"` link → `{t("login")}`
- `"Criar conta"` link → `{t("register")}`
- `"Notas"` → `{t("notes")}`

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/paulospiguel/devSpace/sLabs/jogabola-workspace/jogabola && pnpm tsc --noEmit 2>&1 | grep "athlete-event-detail"
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(public\)/\(athlete\)/event/\[id\]/_components/athlete-event-detail.tsx \
  src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "feat: extract athlete event public view strings to i18n (athleteEventPublic namespace)"
```

---

## Task 3: i18n — athlete-rsvp-sheet.tsx hardcoded strings

The file has many hardcoded Portuguese strings. Introduce namespace `athleteRsvp`.

**Files:**
- Modify: `src/app/(public)/(athlete)/event/[id]/_components/athlete-rsvp-sheet.tsx`
- Modify: `src/locales/pt.json`, `en.json`, `es.json`, `fr.json`

- [ ] **Step 1: Add `athleteRsvp` to pt.json**

```json
"athleteRsvp": {
  "back": "Voltar",
  "resendCode": "Reenviar código",
  "resendIn": "Reenviar em {seconds}s",
  "fillNameEmail": "Preenche o nome e email.",
  "invalidCode": "Código inválido.",
  "enterEmail": "Introduz o teu email.",
  "titles": {
    "choose": "Confirmar Presença",
    "loginEmail": "Entrar na conta",
    "loginOtp": "Verificar email",
    "guestInfo": "Confirmar como Convidado",
    "guestOtp": "Verificar email"
  },
  "continueAsGuest": "Continuar como Convidado",
  "guestEmailHint": "Rápido — verificamos por email",
  "loginEmailHint": "Introduz o teu email e enviamos um código de acesso.",
  "codeSentTo": "Código enviado para",
  "noAccount": "Sem conta? Sem problema — confirmamos via email.",
  "confirmPresence": "Confirmar presença",
  "createAthleteAccount": "Cria a tua conta de atleta",
  "createAccountFree": "atleta. Grátis.",
  "paymentNotes": "Pagamento via MBWay confirmado pelo atleta"
}
```

- [ ] **Step 2: Add `athleteRsvp` to en.json**

```json
"athleteRsvp": {
  "back": "Back",
  "resendCode": "Resend code",
  "resendIn": "Resend in {seconds}s",
  "fillNameEmail": "Fill in your name and email.",
  "invalidCode": "Invalid code.",
  "enterEmail": "Enter your email.",
  "titles": {
    "choose": "Confirm Attendance",
    "loginEmail": "Sign in",
    "loginOtp": "Verify email",
    "guestInfo": "Confirm as Guest",
    "guestOtp": "Verify email"
  },
  "continueAsGuest": "Continue as Guest",
  "guestEmailHint": "Quick — we verify by email",
  "loginEmailHint": "Enter your email and we will send an access code.",
  "codeSentTo": "Code sent to",
  "noAccount": "No account? No problem — we confirm via email.",
  "confirmPresence": "Confirm attendance",
  "createAthleteAccount": "Create your athlete account",
  "createAccountFree": "athlete. Free.",
  "paymentNotes": "Payment via MBWay confirmed by athlete"
}
```

- [ ] **Step 3: Add `athleteRsvp` to es.json**

```json
"athleteRsvp": {
  "back": "Volver",
  "resendCode": "Reenviar código",
  "resendIn": "Reenviar en {seconds}s",
  "fillNameEmail": "Rellena el nombre y email.",
  "invalidCode": "Código inválido.",
  "enterEmail": "Introduce tu email.",
  "titles": {
    "choose": "Confirmar Asistencia",
    "loginEmail": "Iniciar sesión",
    "loginOtp": "Verificar email",
    "guestInfo": "Confirmar como Invitado",
    "guestOtp": "Verificar email"
  },
  "continueAsGuest": "Continuar como Invitado",
  "guestEmailHint": "Rápido — verificamos por email",
  "loginEmailHint": "Introduce tu email y te enviamos un código de acceso.",
  "codeSentTo": "Código enviado a",
  "noAccount": "¿Sin cuenta? Sin problema — confirmamos por email.",
  "confirmPresence": "Confirmar asistencia",
  "createAthleteAccount": "Crea tu cuenta de atleta",
  "createAccountFree": "atleta. Gratis.",
  "paymentNotes": "Pago via MBWay confirmado por el atleta"
}
```

- [ ] **Step 4: Add `athleteRsvp` to fr.json**

```json
"athleteRsvp": {
  "back": "Retour",
  "resendCode": "Renvoyer le code",
  "resendIn": "Renvoyer dans {seconds}s",
  "fillNameEmail": "Remplissez le nom et l'email.",
  "invalidCode": "Code invalide.",
  "enterEmail": "Entrez votre email.",
  "titles": {
    "choose": "Confirmer la présence",
    "loginEmail": "Se connecter",
    "loginOtp": "Vérifier l'email",
    "guestInfo": "Confirmer en tant qu'invité",
    "guestOtp": "Vérifier l'email"
  },
  "continueAsGuest": "Continuer en tant qu'invité",
  "guestEmailHint": "Rapide — nous vérifions par email",
  "loginEmailHint": "Entrez votre email et nous vous enverrons un code d'accès.",
  "codeSentTo": "Code envoyé à",
  "noAccount": "Pas de compte ? Pas de problème — nous confirmons par email.",
  "confirmPresence": "Confirmer la présence",
  "createAthleteAccount": "Créez votre compte athlète",
  "createAccountFree": "athlète. Gratuit.",
  "paymentNotes": "Paiement via MBWay confirmé par l'athlète"
}
```

- [ ] **Step 5: Refactor athlete-rsvp-sheet.tsx**

Add imports:
```tsx
import { useTranslations } from "next-intl";
```

Inside `AthleteRsvpSheet` component, add:
```tsx
const t = useTranslations("athleteRsvp");
```

Replace hardcoded strings:
- `BackButton` `"Voltar"` → pass `t("back")` as a prop or call `useTranslations` inside `BackButton`
- Since `BackButton` is a tiny local component, simplest is to remove it and inline the button in each step OR pass `label` prop. Change `BackButton` to accept `label`:

```tsx
function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-arena-primary hover:text-arena-primary/80">
      <ArrowLeft size={13} />
      {label}
    </button>
  );
}
```

All `<BackButton onClick={...} />` calls → `<BackButton onClick={...} label={t("back")} />`

- `"Reenviar código"` button text → `{t("resendCode")}`
- `<span>Reenviar em {seconds}s</span>` → `<span>{t("resendIn", { seconds })}</span>`
- `setError("Preenche o nome e email.")` → `setError(t("fillNameEmail"))`
- `setError(res.error || "Código inválido.")` → `setError(res.error || t("invalidCode"))`
- `setError("Introduz o teu email.")` → `setError(t("enterEmail"))`
- Step title map:
```tsx
const stepTitles: Record<string, string> = {
  choose: t("titles.choose"),
  "login-email": t("titles.loginEmail"),
  "login-otp": t("titles.loginOtp"),
  "guest-info": t("titles.guestInfo"),
  "guest-otp": t("titles.guestOtp"),
};
```
- `"Continuar como Convidado"` → `{t("continueAsGuest")}`
- `"Rápido — verificamos por email"` → `{t("guestEmailHint")}`
- `"Introduz o teu email e enviamos um código de acesso."` → `{t("loginEmailHint")}`
- `"Código enviado para"` → `{t("codeSentTo")}`
- `"Sem conta? Sem problema — confirmamos via email."` → `{t("noAccount")}`
- `"Confirmar presença"` button → `{t("confirmPresence")}`
- `"Cria a tua conta de atleta"` → `{t("createAthleteAccount")}`
- `"atleta. Grátis."` → `{t("createAccountFree")}`
- `notes: "Pagamento via MBWay confirmado pelo atleta"` → `notes: t("paymentNotes")`

- [ ] **Step 6: Verify TypeScript**

```bash
cd /Users/paulospiguel/devSpace/sLabs/jogabola-workspace/jogabola && pnpm tsc --noEmit 2>&1 | grep "athlete-rsvp"
```
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/app/\(public\)/\(athlete\)/event/\[id\]/_components/athlete-rsvp-sheet.tsx \
  src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "feat: extract athlete RSVP sheet strings to i18n (athleteRsvp namespace)"
```

---

## Task 4: i18n — edit-event-sheet.tsx status options

The status dropdown has hardcoded Portuguese strings.

**Files:**
- Modify: `src/components/arena/edit-event-sheet.tsx`

- [ ] **Step 1: Use existing `arenaEvents.status` translations**

The `pt.json` already has:
```json
"arenaEvents": {
  "status": {
    "scheduled": "Agendado",
    "confirmed": "Confirmado",
    "cancelled": "Cancelado"
  }
}
```

In `edit-event-sheet.tsx`, add:
```tsx
import { useTranslations } from "next-intl";
```

Inside the component, add:
```tsx
const tEvents = useTranslations("arenaEvents");
```

Replace:
```tsx
<SelectItem value="scheduled">Agendado</SelectItem>
<SelectItem value="completed">Concluído</SelectItem>
<SelectItem value="canceled">Cancelado</SelectItem>
```

With:
```tsx
<SelectItem value="scheduled">{tEvents("status.scheduled")}</SelectItem>
<SelectItem value="completed">{tEvents("status.confirmed")}</SelectItem>
<SelectItem value="canceled">{tEvents("status.cancelled")}</SelectItem>
```

Also replace the hardcoded "Cancelar" and "Guardar" buttons at the bottom:

First check if `useTranslations("common")` is already used in this file. If not, add:
```tsx
const tCommon = useTranslations("common");
```

Replace:
- `"Cancelar"` button → `{tCommon("cancel")}`
- `"Guardar"` string → `{tCommon("save")}`

- [ ] **Step 2: Verify TypeScript**

```bash
cd /Users/paulospiguel/devSpace/sLabs/jogabola-workspace/jogabola && pnpm tsc --noEmit 2>&1 | grep "edit-event-sheet"
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/arena/edit-event-sheet.tsx
git commit -m "feat: extract edit-event-sheet hardcoded status strings to i18n"
```

---

## Task 5: Freemium infrastructure — plan tier + team creation limit

Add `plan_tier` column to `user` table, create plan limits constants, enforce max 3 teams on the `createTeam` action, update `CreateTeamSheet` to show limit state.

**Files:**
- Create: `src/constants/plans.ts`
- Modify: `src/db/schema/users.ts`
- Modify: `src/actions/teams.actions.ts`
- Modify: `src/components/arena/create-team-sheet.tsx`
- Modify: `src/locales/pt.json`, `en.json`, `es.json`, `fr.json`

- [ ] **Step 1: Create plan limits constants**

Create `src/constants/plans.ts`:

```ts
export type PlanTier = "free" | "pro" | "elite";

export const PLAN_LIMITS = {
  free: {
    maxTeams: 3,
    maxPlayersPerTeam: 25,
    maxEventsPerMonth: 10,
  },
  pro: {
    maxTeams: 10,
    maxPlayersPerTeam: 50,
    maxEventsPerMonth: 100,
  },
  elite: {
    maxTeams: 999,
    maxPlayersPerTeam: 999,
    maxEventsPerMonth: 9999,
  },
} as const satisfies Record<PlanTier, { maxTeams: number; maxPlayersPerTeam: number; maxEventsPerMonth: number }>;

export const FREE_PLAN_LIMITS = PLAN_LIMITS.free;
```

- [ ] **Step 2: Add plan_tier to user schema**

In `src/db/schema/users.ts`, add the import for the enum and add the column to the `user` table:

```ts
// Add to the user table after the `onboardingCompleted` field:
planTier: text("plan_tier").notNull().default("free"),
```

The full user table should look like:

```ts
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  locale: text("locale").notNull().default("pt"),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  role: text("role"),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  planTier: text("plan_tier").notNull().default("free"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

- [ ] **Step 3: Generate and apply migration**

```bash
cd /Users/paulospiguel/devSpace/sLabs/jogabola-workspace/jogabola && pnpm db:generate
```
Expected: generates a new migration file `src/db/migrations/0017_plan_tier.sql` (or similar name).

```bash
pnpm db:push
```
Expected: applies the migration. Existing users get `plan_tier = 'free'` (the default).

- [ ] **Step 4: Enforce team limit in createTeam action**

In `src/actions/teams.actions.ts`, add import:
```ts
import { PLAN_LIMITS } from "@/constants/plans";
import type { PlanTier } from "@/constants/plans";
```

Update `createTeam` action to check count before inserting:

```ts
export const createTeam = withAuthAction(
  createTeamSchema,
  async (user, data) => {
    // Freemium: check team count against plan limit
    const plan = (user.planTier as PlanTier) ?? "free";
    const limit = PLAN_LIMITS[plan].maxTeams;
    
    const ownedTeams = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.ownerId, user.id));

    if (ownedTeams.length >= limit) {
      return {
        success: false,
        error: {
          code: "TEAM_LIMIT_REACHED",
          limit,
          plan,
        },
      };
    }

    const existingName = await db.query.teams.findFirst({
      where: eq(teams.name, data.name.trim()),
    });

    if (existingName) {
      return { success: false, error: { code: "TEAM_NAME_ALREADY_EXISTS" } };
    }

    const existingSlug = await db.query.teams.findFirst({
      where: eq(teams.slug, data.slug.trim()),
    });

    if (existingSlug) {
      return { success: false, error: { code: "TEAM_SLUG_ALREADY_EXISTS" } };
    }

    const [team] = await db
      .insert(teams)
      .values({ ...data, ownerId: user.id })
      .returning();

    await db.insert(teamMembers).values({
      teamId: team.id,
      playerId: user.id,
      role: "owner",
    });

    await db
      .update(session)
      .set({ teamId: team.id, updatedAt: new Date() })
      .where(eq(session.userId, user.id));

    return { success: true, data: team };
  },
);
```

Note: `withAuthAction` passes the user object — check that `user.planTier` is available. If the `withAuthAction` helper only returns a subset of user fields, update the query in `withAuthAction` or `action-helpers.ts` to include `planTier`. Check `src/lib/action-helpers.ts` to confirm which user fields are returned.

- [ ] **Step 5: Add translations for team limit error**

In `pt.json`, inside `arenaCreateTeam.errors`:
```json
"TEAM_LIMIT_REACHED": "Atingiste o limite de {limit} equipas no plano gratuito. Faz upgrade para criar mais equipas."
```

In `en.json`:
```json
"TEAM_LIMIT_REACHED": "You have reached the {limit}-team limit on the free plan. Upgrade to create more teams."
```

In `es.json`:
```json
"TEAM_LIMIT_REACHED": "Has alcanzado el límite de {limit} equipos en el plan gratuito. Actualiza para crear más equipos."
```

In `fr.json`:
```json
"TEAM_LIMIT_REACHED": "Vous avez atteint la limite de {limit} équipes sur le plan gratuit. Passez à un plan supérieur pour créer plus d'équipes."
```

Also add to `pt.json` under `arenaCreateTeam`:
```json
"limitReachedTitle": "Limite do plano gratuito",
"upgradeCta": "Ver planos"
```

And in the other locale files equivalents:
- en: `"limitReachedTitle": "Free plan limit"`, `"upgradeCta": "View plans"`
- es: `"limitReachedTitle": "Límite del plan gratuito"`, `"upgradeCta": "Ver planes"`
- fr: `"limitReachedTitle": "Limite du plan gratuit"`, `"upgradeCta": "Voir les plans"`

- [ ] **Step 6: Update CreateTeamSheet to handle TEAM_LIMIT_REACHED**

In `src/components/arena/create-team-sheet.tsx`, update the `handleSave` error handling to pass `limit` to the translation:

```tsx
if (!result.success) {
  const code = result.error.code;
  let message: string;
  if (code === "TEAM_LIMIT_REACHED") {
    message = t("errors.TEAM_LIMIT_REACHED", { limit: result.error.limit ?? 3 });
  } else if (t.has(`errors.${code}`)) {
    message = t(`errors.${code}`);
  } else {
    message = result.error.message ?? code ?? "Error creating team";
  }
  setError(message);
  return;
}
```

Also add a locked/upgrade state at the top of the sheet form. Before the form renders, add a pre-check. Import `useTeams`:

```tsx
const { teams: myTeams } = useTeams();
const isAtLimit = myTeams.length >= 3; // free plan limit; future: derive from user.planTier
```

If `isAtLimit`, render a locked state instead of the form:

```tsx
if (isAtLimit) {
  return (
    <JbBottomSheet onClose={onClose} noPad title={t("limitReachedTitle")}>
      <div className="flex flex-col items-center gap-4 px-5 pt-10 pb-12 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-arena-warning/10 text-arena-warning">
          <Shield size={32} />
        </div>
        <p className="text-base font-bold text-arena-text">
          {t("errors.TEAM_LIMIT_REACHED", { limit: 3 })}
        </p>
        <Button
          className="mt-2 h-[50px] w-full rounded-[14px] bg-arena-primary text-[15px] font-bold text-arena-bg"
          onClick={onClose}
        >
          {t("upgradeCta")}
        </Button>
      </div>
    </JbBottomSheet>
  );
}
```

Note: `useTeams` hook — check `src/hooks/use-teams.ts` to confirm it exposes the `teams` array (owned teams). If it only returns the active team, you may need to call `getMyTeams` action separately or use the teams count from the session.

- [ ] **Step 7: Verify TypeScript**

```bash
cd /Users/paulospiguel/devSpace/sLabs/jogabola-workspace/jogabola && pnpm tsc --noEmit 2>&1 | grep -E "plans|teams.actions|create-team-sheet|users.ts"
```
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add src/constants/plans.ts \
  src/db/schema/users.ts \
  src/db/migrations/ \
  src/actions/teams.actions.ts \
  src/components/arena/create-team-sheet.tsx \
  src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "feat: add freemium plan_tier column, PLAN_LIMITS constants, and enforce 3-team free limit on team creation"
```

---

## Task 6: Roadmap page

A public-facing page at `/roadmap` showing the project timeline for users and investors. Linked from the footer under the "Product" column.

**Files:**
- Create: `src/app/(public)/(website)/roadmap/page.tsx`
- Modify: `src/components/footer.tsx`
- Modify: `src/locales/pt.json`, `en.json`, `es.json`, `fr.json`

- [ ] **Step 1: Add roadmap translations to all locales**

In `pt.json`, add at root level:

```json
"roadmapPage": {
  "eyebrow": "Transparência",
  "title": "Roadmap do Projeto",
  "subtitle": "Onde estamos e para onde vamos. Atualizado a cada sprint.",
  "legend": {
    "done": "Concluído",
    "inProgress": "Em progresso",
    "planned": "Planeado",
    "future": "Futuro"
  },
  "phases": [
    {
      "id": "mvp-core",
      "label": "MVP · Núcleo",
      "period": "Q1–Q2 2026",
      "status": "done",
      "items": [
        "Autenticação por email OTP",
        "Criação e gestão de equipas",
        "Convocatórias e confirmação de presença",
        "Página pública do evento (atleta)",
        "Pagamentos e upload de comprovativos",
        "Configuração de métodos de pagamento",
        "Calendário de eventos",
        "Perfil do atleta",
        "Sistema de email transacional"
      ]
    },
    {
      "id": "freemium",
      "label": "Freemium",
      "period": "Q2 2026",
      "status": "inProgress",
      "items": [
        "Plano Free (até 3 equipas, 10 eventos/mês)",
        "Página de planos e preços",
        "Upgrade para plano Pro",
        "Infraestrutura de billing"
      ]
    },
    {
      "id": "pro-features",
      "label": "Pro Features",
      "period": "Q3 2026",
      "status": "planned",
      "items": [
        "Estatísticas avançadas de atletas",
        "Relatórios financeiros exportáveis",
        "Integrações com Google Calendar",
        "Notificações push nativas",
        "Chat integrado"
      ]
    },
    {
      "id": "elite",
      "label": "Elite & Escala",
      "period": "Q4 2026",
      "status": "future",
      "items": [
        "Multi-torneio e ligas",
        "Scouting e networking de atletas",
        "Página pública do clube",
        "App móvel nativa (iOS + Android)",
        "API pública para parceiros"
      ]
    }
  ],
  "cta": {
    "title": "Queres acompanhar de perto?",
    "subtitle": "Junta-te à lista de espera e recebe atualizações em primeira mão.",
    "button": "Entrar na lista de espera"
  },
  "backHome": "Voltar ao início"
}
```

In `en.json`:

```json
"roadmapPage": {
  "eyebrow": "Transparency",
  "title": "Project Roadmap",
  "subtitle": "Where we are and where we're going. Updated every sprint.",
  "legend": {
    "done": "Done",
    "inProgress": "In progress",
    "planned": "Planned",
    "future": "Future"
  },
  "phases": [
    {
      "id": "mvp-core",
      "label": "MVP · Core",
      "period": "Q1–Q2 2026",
      "status": "done",
      "items": [
        "Email OTP authentication",
        "Team creation and management",
        "Call-ups and attendance confirmation",
        "Public event page (athlete view)",
        "Payments and proof upload",
        "Payment method configuration",
        "Event calendar",
        "Athlete profile",
        "Transactional email system"
      ]
    },
    {
      "id": "freemium",
      "label": "Freemium",
      "period": "Q2 2026",
      "status": "inProgress",
      "items": [
        "Free plan (up to 3 teams, 10 events/month)",
        "Plans and pricing page",
        "Upgrade to Pro plan",
        "Billing infrastructure"
      ]
    },
    {
      "id": "pro-features",
      "label": "Pro Features",
      "period": "Q3 2026",
      "status": "planned",
      "items": [
        "Advanced athlete statistics",
        "Exportable financial reports",
        "Google Calendar integration",
        "Native push notifications",
        "Integrated chat"
      ]
    },
    {
      "id": "elite",
      "label": "Elite & Scale",
      "period": "Q4 2026",
      "status": "future",
      "items": [
        "Multi-tournament and leagues",
        "Athlete scouting and networking",
        "Public club page",
        "Native mobile app (iOS + Android)",
        "Public API for partners"
      ]
    }
  ],
  "cta": {
    "title": "Want to follow along?",
    "subtitle": "Join the waitlist and get first-hand updates.",
    "button": "Join waitlist"
  },
  "backHome": "Back to home"
}
```

In `es.json`:

```json
"roadmapPage": {
  "eyebrow": "Transparencia",
  "title": "Hoja de Ruta del Proyecto",
  "subtitle": "Dónde estamos y hacia dónde vamos. Actualizado cada sprint.",
  "legend": {
    "done": "Completado",
    "inProgress": "En progreso",
    "planned": "Planificado",
    "future": "Futuro"
  },
  "phases": [
    {
      "id": "mvp-core",
      "label": "MVP · Núcleo",
      "period": "Q1–Q2 2026",
      "status": "done",
      "items": [
        "Autenticación por email OTP",
        "Creación y gestión de equipos",
        "Convocatorias y confirmación de asistencia",
        "Página pública del evento (atleta)",
        "Pagos y subida de comprobantes",
        "Configuración de métodos de pago",
        "Calendario de eventos",
        "Perfil del atleta",
        "Sistema de email transaccional"
      ]
    },
    {
      "id": "freemium",
      "label": "Freemium",
      "period": "Q2 2026",
      "status": "inProgress",
      "items": [
        "Plan gratuito (hasta 3 equipos, 10 eventos/mes)",
        "Página de planes y precios",
        "Actualización al plan Pro",
        "Infraestructura de facturación"
      ]
    },
    {
      "id": "pro-features",
      "label": "Funciones Pro",
      "period": "Q3 2026",
      "status": "planned",
      "items": [
        "Estadísticas avanzadas de atletas",
        "Informes financieros exportables",
        "Integración con Google Calendar",
        "Notificaciones push nativas",
        "Chat integrado"
      ]
    },
    {
      "id": "elite",
      "label": "Elite y Escala",
      "period": "Q4 2026",
      "status": "future",
      "items": [
        "Multi-torneo y ligas",
        "Scouting y networking de atletas",
        "Página pública del club",
        "App móvil nativa (iOS + Android)",
        "API pública para socios"
      ]
    }
  ],
  "cta": {
    "title": "¿Quieres seguir de cerca?",
    "subtitle": "Únete a la lista de espera y recibe actualizaciones de primera mano.",
    "button": "Unirse a la lista de espera"
  },
  "backHome": "Volver al inicio"
}
```

In `fr.json`:

```json
"roadmapPage": {
  "eyebrow": "Transparence",
  "title": "Feuille de Route du Projet",
  "subtitle": "Où nous en sommes et où nous allons. Mis à jour à chaque sprint.",
  "legend": {
    "done": "Terminé",
    "inProgress": "En cours",
    "planned": "Planifié",
    "future": "Futur"
  },
  "phases": [
    {
      "id": "mvp-core",
      "label": "MVP · Noyau",
      "period": "Q1–Q2 2026",
      "status": "done",
      "items": [
        "Authentification par email OTP",
        "Création et gestion d'équipes",
        "Convocations et confirmation de présence",
        "Page publique de l'événement (athlète)",
        "Paiements et upload de justificatifs",
        "Configuration des méthodes de paiement",
        "Calendrier des événements",
        "Profil de l'athlète",
        "Système d'email transactionnel"
      ]
    },
    {
      "id": "freemium",
      "label": "Freemium",
      "period": "Q2 2026",
      "status": "inProgress",
      "items": [
        "Plan gratuit (jusqu'à 3 équipes, 10 événements/mois)",
        "Page des plans et tarifs",
        "Passage au plan Pro",
        "Infrastructure de facturation"
      ]
    },
    {
      "id": "pro-features",
      "label": "Fonctionnalités Pro",
      "period": "Q3 2026",
      "status": "planned",
      "items": [
        "Statistiques avancées des athlètes",
        "Rapports financiers exportables",
        "Intégration Google Calendar",
        "Notifications push natives",
        "Chat intégré"
      ]
    },
    {
      "id": "elite",
      "label": "Élite & Échelle",
      "period": "Q4 2026",
      "status": "future",
      "items": [
        "Multi-tournoi et ligues",
        "Scouting et networking d'athlètes",
        "Page publique du club",
        "Application mobile native (iOS + Android)",
        "API publique pour partenaires"
      ]
    }
  ],
  "cta": {
    "title": "Vous voulez suivre de près ?",
    "subtitle": "Rejoignez la liste d'attente et recevez des mises à jour en avant-première.",
    "button": "Rejoindre la liste d'attente"
  },
  "backHome": "Retour à l'accueil"
}
```

- [ ] **Step 2: Create the roadmap page**

Create `src/app/(public)/(website)/roadmap/page.tsx`:

```tsx
import { CheckCircle2, Circle, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/utils";

type PhaseStatus = "done" | "inProgress" | "planned" | "future";

const statusConfig: Record<PhaseStatus, { icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  done: {
    icon: CheckCircle2,
    color: "text-arena-success",
    bg: "bg-arena-success/10",
    border: "border-arena-success/30",
  },
  inProgress: {
    icon: Zap,
    color: "text-arena-primary",
    bg: "bg-arena-primary/10",
    border: "border-arena-primary/30",
  },
  planned: {
    icon: Clock,
    color: "text-arena-info",
    bg: "bg-arena-info/10",
    border: "border-arena-info/30",
  },
  future: {
    icon: Circle,
    color: "text-arena-text-muted",
    bg: "bg-arena-surface",
    border: "border-arena-border",
  },
};

export default async function RoadmapPage() {
  const t = await getTranslations("roadmapPage");

  const phases = t.raw("phases") as Array<{
    id: string;
    label: string;
    period: string;
    status: PhaseStatus;
    items: string[];
  }>;

  const legend = [
    { key: "done" as PhaseStatus, label: t("legend.done") },
    { key: "inProgress" as PhaseStatus, label: t("legend.inProgress") },
    { key: "planned" as PhaseStatus, label: t("legend.planned") },
    { key: "future" as PhaseStatus, label: t("legend.future") },
  ];

  return (
    <main className="min-h-screen bg-[#080a25] px-4 py-20">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-black tracking-[0.3em] text-neon-primary/80 uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="mb-4 text-4xl font-black tracking-tight text-white">
            {t("title")}
          </h1>
          <p className="text-lg text-white/55">{t("subtitle")}</p>
        </div>

        {/* Legend */}
        <div className="mb-12 flex flex-wrap justify-center gap-4">
          {legend.map(({ key, label }) => {
            const cfg = statusConfig[key];
            return (
              <div key={key} className="flex items-center gap-2">
                <cfg.icon size={14} className={cfg.color} />
                <span className="text-xs font-semibold text-white/55">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/8" />

          <div className="flex flex-col gap-8">
            {phases.map((phase) => {
              const cfg = statusConfig[phase.status];
              const Icon = cfg.icon;
              return (
                <div key={phase.id} className="relative flex gap-6">
                  {/* Status dot */}
                  <div
                    className={cn(
                      "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border",
                      cfg.bg,
                      cfg.border,
                    )}
                  >
                    <Icon size={18} className={cfg.color} />
                  </div>

                  {/* Content */}
                  <div
                    className={cn(
                      "flex-1 rounded-2xl border p-5",
                      phase.status === "inProgress"
                        ? "border-arena-primary/30 bg-arena-primary/5 shadow-[0_0_30px_rgba(124,255,79,0.05)]"
                        : "border-white/8 bg-white/2",
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            cfg.color,
                          )}
                        >
                          {phase.label}
                        </span>
                        <p className="mt-0.5 text-xs text-white/38">{phase.period}</p>
                      </div>
                      {phase.status === "inProgress" && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arena-primary opacity-75" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-arena-primary" />
                        </span>
                      )}
                    </div>

                    <ul className="space-y-1.5">
                      {phase.items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <span
                            className={cn(
                              "mt-0.5 shrink-0",
                              phase.status === "done"
                                ? "text-arena-success"
                                : "text-white/25",
                            )}
                          >
                            <CheckCircle2 size={13} />
                          </span>
                          <span
                            className={cn(
                              "text-sm",
                              phase.status === "done"
                                ? "text-white/65 line-through decoration-white/20"
                                : phase.status === "inProgress"
                                  ? "text-white/85 font-medium"
                                  : "text-white/40",
                            )}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 rounded-3xl border border-white/8 bg-white/2 p-10 text-center">
          <h2 className="mb-3 text-2xl font-black text-white">{t("cta.title")}</h2>
          <p className="mb-8 text-white/55">{t("cta.subtitle")}</p>
          <Link
            href="/waitlist"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-neon-primary px-8 text-sm font-bold text-[#080a25] transition-opacity hover:opacity-90"
          >
            {t("cta.button")}
          </Link>
        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link href="/" className="text-sm text-white/38 hover:text-white/65 transition-colors">
            ← {t("backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add roadmap link to footer**

In `src/components/footer.tsx`, update the `footerLinks` array. In the `product` column, add the roadmap link:

```tsx
{
  title: t("columns.product"),
  links: [
    { label: t("links.features"), href: "/#funcionalidades" },
    { label: t("links.plans"), href: "/#planos" },
    { label: t("links.roadmap"), href: "/roadmap" },  // ADD THIS
  ],
},
```

Add `"roadmap": "Roadmap"` to `footer.links` in all four locale files:

In `pt.json` under `footer.links`:
```json
"roadmap": "Roadmap"
```
In `en.json` under `footer.links`:
```json
"roadmap": "Roadmap"
```
In `es.json` under `footer.links`:
```json
"roadmap": "Hoja de Ruta"
```
In `fr.json` under `footer.links`:
```json
"roadmap": "Feuille de Route"
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/paulospiguel/devSpace/sLabs/jogabola-workspace/jogabola && pnpm tsc --noEmit 2>&1 | grep -E "roadmap|footer"
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(public)/(website)/roadmap/page.tsx" \
  src/components/footer.tsx \
  src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "feat: add public roadmap page with phase timeline and footer link"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| Remove "Convidar atletas" from athlete shared view | Task 1 ✓ |
| i18n hardcoded strings in athlete-event-detail.tsx | Task 2 ✓ |
| i18n hardcoded strings in athlete-rsvp-sheet.tsx | Task 3 ✓ |
| i18n hardcoded strings in edit-event-sheet.tsx | Task 4 ✓ |
| Freemium constants (free/pro/elite) | Task 5 ✓ |
| Max 3 teams for free plan enforced | Task 5 ✓ |
| DB column for plan_tier | Task 5 ✓ |
| UI feedback when team limit reached | Task 5 ✓ |
| Roadmap page with timeline | Task 6 ✓ |
| Footer link to roadmap | Task 6 ✓ |

**Potential gaps:**

1. **`withAuthAction` user fields** — Task 5 Step 4 notes that `user.planTier` must be available. Check `src/lib/action-helpers.ts` to confirm `planTier` is included in the user query. If not, update the helper's DB select to include it before running Task 5.

2. **`useTeams` hook teams count** — Task 5 Step 6 uses `myTeams.length >= 3`. Check `src/hooks/use-teams.ts` to confirm `teams` is the array of owned teams (not just the active one). If the hook only provides the active team, call `getMyTeams` action in `CreateTeamSheet` on mount instead.

3. **Roadmap page layout** — The page at `src/app/(public)/(website)/roadmap/page.tsx` inherits the `(website)` layout. Check `src/app/(public)/(website)/layout.tsx` to ensure it wraps with header/footer correctly.

4. **es.json and fr.json structure** — Confirm both files follow the same top-level structure as `pt.json`. If they are incomplete stubs, add only the new keys without breaking existing structure.
