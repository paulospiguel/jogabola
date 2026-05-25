# JogaBola v3 Interface Flow Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the remaining interface and flow improvements from `/Users/paulospiguel/devSpace/sLabs/Assets/jogabola/designer-system/claude-design/JogaBola v3 - Standalone.html` into the existing Next.js mobile app without changing domain persistence, auth handlers, or server actions unless a task explicitly says to only consume existing APIs.

**Architecture:** Treat the v3 standalone file as a visual/flow reference, not as source code to paste. Build small reusable `arena/*` primitives for repeated UI patterns, then update one route or flow per task so every commit is independently reviewable. Keep server data loading and existing hooks intact; add client state only for UI mode, tabs, sheets, filtering, and optimistic affordances.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind v4 arena tokens, next-intl JSON locales, framer-motion, lucide-react, shadcn/radix primitives already in the repo, existing `arena/*` components.

---

## Source Inventory From v3 Standalone

The standalone prototype contains these screens and flows:

- `login`: full-screen brand login with shield mark, passkey animation, loading affordance.
- `dashboard`: next event hero, quick stats, pending roster, create-event entry.
- `events`: event list with calendar shortcut and create event CTA.
- `calendar`: `Semana`, `Mes`, `Ano`, `Intervalo` views, event dots by type, navigator, range inputs, legend.
- `event`: event detail with swipe next/previous, tabs, share flow, mural notices, chat, payment/attendance affordances.
- `eventPublic`: public invitation flow with guest form, OTP step, payment/proof step, success step.
- `payments`: history/config tabs, payment stats, filters, proof approval/rejection, method configuration sheets.
- `squad`: search, status filters, add-player FAB, player row polish.
- `player`: player profile hero, history, stats.
- `equipa`: user/profile hub with active team picker, team management, notification/security/profile/billing sheets.
- `rankings`: league/top scorers/assists tabs.
- `historico`: seasons and recent matches.
- Shared shell: `TopBar`, `BottomNav`, `CreateEventSheet`, `AddPlayerSheet`, `ShareSheet`, `TeamManagementSheet`, `NotifSettingsSheet`, `SecuritySheet`, `EditProfileSheet`, `PlanSheet`.

Existing repo already has partial coverage for dashboard/events/event detail/squad/notifications/onboarding. This plan focuses on missing or incomplete v3 improvements: calendar polish, public invitation flow parity, payments advanced UI, profile/equipa hub, rankings/history routes, shell navigation, and shared primitives.

## Non-Negotiables

- UI copy is PT-PT first; update `src/locales/pt.json`, `en.json`, `es.json`, and `fr.json` with identical key shape.
- Use only `--color-arena-*` utilities/tokens for app UI.
- Use Sora for display headings and Inter/body defaults already configured.
- Prefer existing components: `Cta`, `ProgressBar`, `BottomSheet`, `ScreenHeader`, `JbAvatar`, `JbBadge`, `PlayerRow`, `LocationMap`, `UserMenu`, `MobileTopBar`, `BottomNav`.
- Do not introduce new business behavior by mutating actions or DB schema for visual-only tasks.
- If a flow needs data that is not available yet, render a real UI using existing data/hook outputs and a clear empty/loading state.
- Avoid code comments unless they clarify a non-obvious flow decision.

## Verification Commands

Run after each task unless the task says otherwise:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check <touched files>
pnpm build
```

Run when locale keys change:

```bash
node -e "for (const f of ['pt','en','es','fr']) JSON.parse(require('fs').readFileSync(`src/locales/${f}.json`, 'utf8')); console.log('locale json ok')"
```

Visual smoke checks:

```bash
pnpm dev
# open mobile viewport 390x844:
# /arena/calendar
# /arena/events
# /arena/events/<known-id>
# /event/<known-id>
# /arena/payments
# /arena/profile
```

Known repository caveat at plan time: `pnpm lint` is globally red from pre-existing diagnostics outside this scope. Use targeted `pnpm exec biome check <touched files>` for task closure, and only fix unrelated lint if the task touches that file.

---

## File Structure

### Shared Components

- Create `src/components/arena/segmented-control.tsx`
  - Reusable v3 tab selector for compact mode switches.
- Create `src/components/arena/icon-action.tsx`
  - Square/circular icon button with `aria-label`, `active:scale-[0.97]`, arena colors.
- Create `src/components/arena/empty-state.tsx`
  - Compact empty state used by calendar, payments, rankings/history.
- Create `src/components/arena/metric-card.tsx`
  - Small stat card for dashboard/payments/profile/rankings.
- Create `src/components/arena/event-row.tsx`
  - Shared compact event row for calendar/events/history lists.

### Navigation Shell

- Modify `src/components/arena/bottom-nav.tsx`
  - Add v3 `Perfil` destination and optional notification dot support if hook is available.
- Modify `src/components/arena/mobile-top-bar.tsx`
  - Align brand/team/notification/avatar layout with v3 `TopBar`.
- Modify `src/app/(mobile)/(protected)/arena/layout.tsx`
  - Ensure shell spacing still works with updated top and bottom nav.

### Calendar

- Modify `src/app/(mobile)/(protected)/arena/calendar/page.tsx`
  - Keep server action data loading.
- Modify `src/app/(mobile)/(protected)/arena/calendar/_components/calendar-events.tsx`
  - Match v3 month-first calendar flow, segmented views, navigator, event dots, legend, range view.

### Event Detail And Public Invitation

- Modify `src/app/(mobile)/(protected)/arena/events/[id]/_components/event-detail.tsx`
  - Add v3 share sheet trigger, event navigation affordance where data exists, mural notice sheet, and tab polish.
- Modify `src/components/arena/event-notice-wall.tsx`
  - Align with v3 `MuralSheet`/notice composer visual behavior if existing API supports it.
- Modify `src/app/(mobile)/(athlete)/event/[id]/_components/athlete-event-detail.tsx`
  - Align public invite hero with v3 `PublicEventScreen`.
- Modify `src/app/(mobile)/(athlete)/event/[id]/_components/athlete-rsvp-sheet.tsx`
  - Ensure guest form -> OTP/payment/proof/success step visually matches v3 without changing action contracts.
- Modify `src/app/(mobile)/(athlete)/event/[id]/_components/my-payment-tab.tsx`
  - Match v3 proof/payment card hierarchy.

### Payments

- Modify `src/app/(mobile)/(protected)/arena/payments/page.tsx`
  - Add v3 `history/config` tabs, stats strip, filters, proof review sheet entry points using existing payment hooks.
- Modify `src/app/(mobile)/(protected)/arena/payments/[id]/page.tsx`
  - Align payment detail with proof viewer and action hierarchy.
- Modify `src/components/arena/payment-settings-sheet.tsx`
  - Match v3 method configuration sheet layout while preserving existing fields/actions.
- Modify `src/components/arena/payment-method-card.tsx`
  - Align method cards with v3 icon/color/status presentation.
- Modify `src/components/arena/manual-mark-paid-sheet.tsx`
  - Align manual payment confirmation sheet with v3 proof approval pattern.

### Profile, Team Hub, Settings

- Modify `src/app/(mobile)/(protected)/arena/profile/page.tsx`
  - Convert profile page into v3-style `equipa` hub: hero, stats, active team card, preferences/actions.
- Modify `src/app/(mobile)/(protected)/arena/profile/_components/profile-form.tsx`
  - Use sheet-friendly fields and v3 edit affordance where practical.
- Modify `src/app/(mobile)/(protected)/arena/settings/page.tsx`
  - Keep as direct route but visually align with profile hub sheets.
- Modify `src/app/(mobile)/(protected)/arena/settings/_components/settings-form.tsx`
  - Align notification/language controls with v3 toggles.
- Create `src/components/arena/team-management-sheet.tsx`
  - UI shell for admins/transfer/delete team sections using existing team data where available.
- Create `src/components/arena/security-sheet.tsx`
  - Passkeys/sessions/2FA visual shell using existing passkey affordances where available.
- Create `src/components/arena/plan-sheet.tsx`
  - Plan/billing comparison sheet as visual-only MVP unless billing data already exists.

### Rankings And History

- Create `src/app/(mobile)/(protected)/arena/rankings/page.tsx`
  - New v3 rankings screen using existing team/player data if available.
- Create `src/app/(mobile)/(protected)/arena/history/page.tsx`
  - New v3 seasons/history screen using existing events/matches data if available.
- Modify `src/components/arena/sidebar.tsx`
  - Add desktop/sidebar navigation entries for rankings/history only if routes are introduced.
- Modify `src/components/arena/desktop-sidebar.tsx`
  - Keep desktop shell consistent with new routes.

### Auth And Onboarding Polish

- Modify `src/app/(mobile)/auth/page.tsx`
  - Apply remaining v3 login visual refinements while preserving Better Auth and OTP/passkey handlers.
- Modify `src/app/(mobile)/(protected)/onboarding/_components/onboarding-client.tsx`
  - Only adjust if visual gaps remain against v3 8-step overlay.
- Modify `src/app/(mobile)/(protected)/onboarding/_components/survey-step.tsx`
  - Same as above.

### Locales And Documentation

- Modify `src/locales/pt.json`
- Modify `src/locales/en.json`
- Modify `src/locales/es.json`
- Modify `src/locales/fr.json`
- Modify `DESIGN.md`
  - Add final v3 flow map and new shared component guidance.

---

## Task 1: Shared v3 Arena Primitives

**Files:**
- Create: `src/components/arena/segmented-control.tsx`
- Create: `src/components/arena/icon-action.tsx`
- Create: `src/components/arena/empty-state.tsx`
- Create: `src/components/arena/metric-card.tsx`
- Create: `src/components/arena/event-row.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect existing component style**

Run:

```bash
sed -n '1,180p' src/components/arena/cta.tsx
sed -n '1,180p' src/components/arena/progress-bar.tsx
sed -n '1,220p' src/components/arena/player-row.tsx
```

Expected: confirm class naming, arena tokens, `cn()` usage, and button press behavior.

- [ ] **Step 2: Create `SegmentedControl`**

Implement this API:

```tsx
type SegmentedOption<T extends string> = {
  id: T;
  label: string;
  icon?: React.ElementType;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
};
```

Behavior:
- Render native `button` elements.
- Active option uses `border-arena-primary/60 bg-arena-primary/15 text-arena-primary`.
- Inactive option uses `border-arena-border bg-arena-surface text-arena-text-sec`.
- Use `active:scale-[0.97]`.

- [ ] **Step 3: Create `IconAction`**

Implement this API:

```tsx
type IconActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  tone?: "neutral" | "primary" | "danger" | "info";
};
```

Behavior:
- Use `aria-label={label}` and visually render only the icon by default.
- Keep dimensions stable: `size-9 rounded-xl`.
- Use lucide icons passed through `icon`.

- [ ] **Step 4: Create `ArenaEmptyState`**

Implement this API:

```tsx
type ArenaEmptyStateProps = {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};
```

Behavior:
- Centered compact card, no nested cards.
- Use `text-arena-text`, `text-arena-text-muted`, `border-arena-border`, `bg-arena-surface/70`.

- [ ] **Step 5: Create `MetricCard`**

Implement this API:

```tsx
type MetricCardProps = {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  tone?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
};
```

Behavior:
- Stable card dimensions for dense dashboards.
- Use arena token tones only.

- [ ] **Step 6: Create `EventRow`**

Implement this API:

```tsx
type EventRowProps = {
  href: string;
  title: string;
  type: "game" | "training" | "event";
  dateLabel?: string;
  timeLabel?: string;
  location?: string;
  statusLabel?: string;
  resultLabel?: string;
};
```

Behavior:
- `Link` row with type icon/dot, compact title, time/location metadata, right chevron.
- Use `Shield`/`Calendar`/`Trophy` or existing lucide equivalents.

- [ ] **Step 7: Add locale keys for shared empty/action labels if needed**

Add under `arenaShared`:

```json
{
  "calendar": "Calendario",
  "createEvent": "Criar evento",
  "emptyTitle": "Sem resultados",
  "emptyDescription": "Tenta ajustar os filtros."
}
```

Translate in `en`, `es`, `fr`.

- [ ] **Step 8: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/components/arena/segmented-control.tsx src/components/arena/icon-action.tsx src/components/arena/empty-state.tsx src/components/arena/metric-card.tsx src/components/arena/event-row.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
node -e "for (const f of ['pt','en','es','fr']) JSON.parse(require('fs').readFileSync(`src/locales/${f}.json`, 'utf8')); console.log('locale json ok')"
```

Expected: typecheck passes; targeted Biome passes; locale parse prints `locale json ok`.

- [ ] **Step 9: Commit**

```bash
git add src/components/arena/segmented-control.tsx src/components/arena/icon-action.tsx src/components/arena/empty-state.tsx src/components/arena/metric-card.tsx src/components/arena/event-row.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] add v3 arena primitives"
```

---

## Task 2: Mobile Shell Navigation Parity

**Files:**
- Modify: `src/components/arena/bottom-nav.tsx`
- Modify: `src/components/arena/mobile-top-bar.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/layout.tsx`
- Modify: `src/components/arena/sidebar.tsx`
- Modify: `src/components/arena/desktop-sidebar.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect current nav labels**

Run:

```bash
rg -n '"arenaNav"|"dashboard"|"squads"|"events"|"payments"|"profile"|"/arena/profile"|"/arena/settings"' src/components/arena src/locales/pt.json
```

Expected: identify existing `arenaNav` keys and destinations.

- [ ] **Step 2: Add bottom nav `Perfil` destination**

Update `ITEMS` in `bottom-nav.tsx`:

```tsx
{ href: "/arena/profile", icon: User, labelKey: "profile", requiresTeam: false }
```

Rules:
- Keep `dashboard`, `squads`, `events`, `payments`.
- Use lucide `User`.
- Do not add notification item to bottom nav unless UX explicitly requires it; v3 prototype had notification logic but current app already has top-bar bell.

- [ ] **Step 3: Make active matching exact enough**

Ensure `/arena/profile` does not accidentally activate `/arena` dashboard:

```tsx
const isActive =
  pathname === item.href ||
  (item.href !== "/arena" && pathname.startsWith(item.href));
```

Expected: this already exists; keep it.

- [ ] **Step 4: Align `MobileTopBar` with v3 density**

Update `mobile-top-bar.tsx`:
- Keep `Logo` link to `/arena`.
- Keep notification link to `/arena/notifications`.
- Keep `UserMenu onlyAvatar`.
- Reduce any text crowding on 390px widths.
- Use `bg-arena-bg-sec/95` or existing `bg-arena-bg/90` only; no new colors.

- [ ] **Step 5: Add locale labels**

Add/update `arenaNav.profile` in all locales.

- [ ] **Step 6: Add desktop/sidebar entries only for routes that already exist**

If Task 9 has not been implemented yet, do not add rankings/history sidebar links in this task.

- [ ] **Step 7: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/components/arena/bottom-nav.tsx src/components/arena/mobile-top-bar.tsx src/app/'(mobile)'/'(protected)'/arena/layout.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
```

Expected: passes.

- [ ] **Step 8: Visual smoke**

Open mobile viewport `390x844`:
- `/arena`
- `/arena/squads`
- `/arena/events`
- `/arena/payments`
- `/arena/profile`

Expected: bottom nav has five stable items; no label overlap; profile item activates on `/arena/profile`.

- [ ] **Step 9: Commit**

```bash
git add src/components/arena/bottom-nav.tsx src/components/arena/mobile-top-bar.tsx src/app/'(mobile)'/'(protected)'/arena/layout.tsx src/components/arena/sidebar.tsx src/components/arena/desktop-sidebar.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] align v3 mobile navigation shell"
```

---

## Task 3: Calendar v3 Multi-View Polish

**Files:**
- Modify: `src/app/(mobile)/(protected)/arena/calendar/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/calendar/_components/calendar-events.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect current calendar implementation**

Run:

```bash
sed -n '1,260p' src/app/'(mobile)'/'(protected)'/arena/calendar/_components/calendar-events.tsx
sed -n '260,620p' src/app/'(mobile)'/'(protected)'/arena/calendar/_components/calendar-events.tsx
sed -n '620,920p' src/app/'(mobile)'/'(protected)'/arena/calendar/_components/calendar-events.tsx
```

Expected: confirm existing week/month/year/range support and pre-existing lint warnings.

- [ ] **Step 2: Set v3 default view**

Change initial `viewMode` to `"month"` if product wants prototype parity:

```tsx
const [viewMode, setViewMode] = useState<ViewMode>("month");
```

If keeping week-first is intentional, document the reason in `DESIGN.md` and leave code unchanged.

- [ ] **Step 3: Replace local view tabs with `SegmentedControl`**

Map:

```tsx
const viewOptions = [
  { id: "week", label: t("views.week") },
  { id: "month", label: t("views.month") },
  { id: "year", label: t("views.year") },
  { id: "range", label: t("views.range") },
] satisfies Array<{ id: ViewMode; label: string }>;
```

Render:

```tsx
<SegmentedControl
  value={viewMode}
  options={viewOptions}
  onChange={setViewMode}
  ariaLabel={t("views.ariaLabel")}
/>
```

- [ ] **Step 4: Align hero/header with v3**

Header content:
- Eyebrow: `Arena`
- Title: `Calendario de eventos`
- Right action: `Cta` or `IconAction` linking/opening create event if current route has access to existing create-event sheet.

Do not implement event creation logic here unless existing sheet/action is already wired in layout.

- [ ] **Step 5: Ensure event type dots use arena tokens**

Replace hardcoded `#7cff4f`, `#38bdf8`, `#f59e0b` with classes or CSS vars:
- game: `var(--color-arena-primary)`
- training: `var(--color-arena-info)`
- event: `var(--color-arena-warning)`

- [ ] **Step 6: Replace repeated event list rows with `EventRow`**

For each calendar event row:

```tsx
<EventRow
  href={`/arena/events/${session.id}`}
  title={session.title}
  type={inferType(session.title)}
  timeLabel={formatDuration(session.startsAt, session.endsAt)}
  location={session.location}
  statusLabel={statusLabel}
/>
```

- [ ] **Step 7: Fix index keys touched by this file**

Do not keep `key={i}` for generated weekday/month cells. Use stable keys:

```tsx
key={format(day, "yyyy-MM-dd")}
```

For month index buttons:

```tsx
key={format(mStart, "yyyy-MM")}
```

- [ ] **Step 8: Add/verify locale keys**

Under `arenaCalendar`, ensure keys exist in all locales:

```json
{
  "hero": {
    "eyebrow": "Arena",
    "title": "Calendario de eventos",
    "create": "Criar evento"
  },
  "views": {
    "ariaLabel": "Vista do calendario",
    "week": "Semana",
    "month": "Mes",
    "year": "Ano",
    "range": "Intervalo"
  },
  "legend": {
    "game": "Jogo",
    "training": "Treino",
    "event": "Evento"
  }
}
```

Translate `en/es/fr`.

- [ ] **Step 9: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/app/'(mobile)'/'(protected)'/arena/calendar/page.tsx src/app/'(mobile)'/'(protected)'/arena/calendar/_components/calendar-events.tsx src/components/arena/segmented-control.tsx src/components/arena/event-row.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
pnpm build
```

Expected: all pass for touched files; build passes.

- [ ] **Step 10: Visual smoke**

Open `/arena/calendar` in mobile viewport.

Expected:
- Month view is stable and non-overlapping at `390x844`.
- Tapping Semana/Mes/Ano/Intervalo switches views.
- Event dots and legend match game/training/event types.
- Empty day/range states use `ArenaEmptyState`.

- [ ] **Step 11: Commit**

```bash
git add src/app/'(mobile)'/'(protected)'/arena/calendar/page.tsx src/app/'(mobile)'/'(protected)'/arena/calendar/_components/calendar-events.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] polish v3 calendar flow"
```

---

## Task 4: Events List Calendar Shortcut And Card Parity

**Files:**
- Modify: `src/app/(mobile)/(protected)/arena/events/_components/events-list.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/events/page.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect current events list**

Run:

```bash
sed -n '1,280p' src/app/'(mobile)'/'(protected)'/arena/events/_components/events-list.tsx
```

Expected: identify existing tabs, empty state, create CTA.

- [ ] **Step 2: Add calendar shortcut in header**

Add an `IconAction` or `Link` icon button to `/arena/calendar` with `Calendar` icon and localized `aria-label`.

- [ ] **Step 3: Replace repeated cards with `EventRow` where compact rows are used**

Keep richer cards if already needed, but align:
- type badge/dot
- title
- date/time
- location
- confirmed count/result on the right

- [ ] **Step 4: Preserve create-event flow**

Use existing create event sheet/action if currently wired. Do not add a duplicate sheet.

- [ ] **Step 5: Verify locale keys**

Add under `arenaEvents.header.calendarShortcut` in all locales.

- [ ] **Step 6: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/app/'(mobile)'/'(protected)'/arena/events/page.tsx src/app/'(mobile)'/'(protected)'/arena/events/_components/events-list.tsx src/components/arena/event-row.tsx src/components/arena/icon-action.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
```

Expected: passes.

- [ ] **Step 7: Visual smoke**

Open `/arena/events`.

Expected:
- Header shows Eventos, calendar shortcut, create CTA.
- Cards/rows do not overflow.
- Shortcut navigates to `/arena/calendar`.

- [ ] **Step 8: Commit**

```bash
git add src/app/'(mobile)'/'(protected)'/arena/events/page.tsx src/app/'(mobile)'/'(protected)'/arena/events/_components/events-list.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] align v3 events list actions"
```

---

## Task 5: Event Detail Share, Mural, And Navigation Flow

**Files:**
- Modify: `src/app/(mobile)/(protected)/arena/events/[id]/_components/event-detail.tsx`
- Modify: `src/components/arena/event-notice-wall.tsx`
- Create: `src/components/arena/share-event-sheet.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect current event detail and notice wall**

Run:

```bash
sed -n '1,260p' src/app/'(mobile)'/'(protected)'/arena/events/'[id]'/_components/event-detail.tsx
sed -n '260,680p' src/app/'(mobile)'/'(protected)'/arena/events/'[id]'/_components/event-detail.tsx
sed -n '1,260p' src/components/arena/event-notice-wall.tsx
```

Expected: understand current tabs, share bar, edit sheet, attendance actions.

- [ ] **Step 2: Extract share UI into `ShareEventSheet`**

API:

```tsx
type ShareEventSheetProps = {
  eventId: number;
  eventTitle: string;
  eventDateLabel?: string;
  eventTimeLabel?: string;
  onClose: () => void;
};
```

Use `BottomSheet`. Include:
- event summary card
- copy link action
- WhatsApp action
- Telegram action
- QR placeholder only if no QR generator already exists; label it as link preview, not functional QR.

- [ ] **Step 3: Replace inline share bar with sheet trigger**

Add an icon action in event hero or header:

```tsx
<IconAction icon={Share2} label={t("share.open")} onClick={() => setShareOpen(true)} />
```

Keep current copy/social logic inside the sheet.

- [ ] **Step 4: Align notice wall with v3 mural pattern**

Use existing `EventNoticeWall`; polish:
- compact manager notice cards
- compose CTA only when allowed by current props/API
- empty state for no notices

Do not invent persistence.

- [ ] **Step 5: Add swipe/navigation only if route can know adjacent events**

If `EventDetail` only receives one event, do not implement fake swipe. Instead add a small plan note in `DESIGN.md` that adjacent-event navigation requires parent route data.

- [ ] **Step 6: Add locale keys**

Under `arenaEventDetail.share`:

```json
{
  "open": "Partilhar convocatoria",
  "title": "Partilhar convocatoria",
  "event": "Evento",
  "linkPreview": "Link publico",
  "copy": "Copiar link",
  "copied": "Copiado",
  "whatsapp": "WhatsApp",
  "telegram": "Telegram"
}
```

Translate in `en/es/fr`.

- [ ] **Step 7: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/app/'(mobile)'/'(protected)'/arena/events/'[id]'/_components/event-detail.tsx src/components/arena/event-notice-wall.tsx src/components/arena/share-event-sheet.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
pnpm build
```

Expected: passes.

- [ ] **Step 8: Visual smoke**

Open `/arena/events/<known-id>`.

Expected:
- Share icon opens bottom sheet.
- Copy action changes to copied state.
- Mural/notice section is readable and non-overlapping.
- Attendance CTA remains sticky/usable.

- [ ] **Step 9: Commit**

```bash
git add src/app/'(mobile)'/'(protected)'/arena/events/'[id]'/_components/event-detail.tsx src/components/arena/event-notice-wall.tsx src/components/arena/share-event-sheet.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] add v3 event share and mural flow"
```

---

## Task 6: Public Event Invite Flow Parity

**Files:**
- Modify: `src/app/(mobile)/(athlete)/event/[id]/_components/athlete-event-detail.tsx`
- Modify: `src/app/(mobile)/(athlete)/event/[id]/_components/athlete-rsvp-sheet.tsx`
- Modify: `src/app/(mobile)/(athlete)/event/[id]/_components/my-payment-tab.tsx`
- Modify: `src/app/(mobile)/(athlete)/event/[id]/_components/countdown-timer.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect public event components and action boundaries**

Run:

```bash
sed -n '1,260p' src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/athlete-event-detail.tsx
sed -n '1,460p' src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/athlete-rsvp-sheet.tsx
sed -n '1,260p' src/app/'(mobile)'/'(athlete)'/event/'[id]'/page.tsx
```

Expected: identify current guest/user RSVP, payment, and proof upload contracts.

- [ ] **Step 2: Map v3 public flow to current states**

Map:
- v3 `view` -> current event detail hero + RSVP CTA
- v3 `otp` -> existing guest verification step, if present
- v3 `pay` -> existing payment/proof tab/sheet
- v3 `done` -> existing success/confirmed state

Do not add fake OTP acceptance (`123456`) from prototype.

- [ ] **Step 3: Align public event hero**

Use:
- gradient top band
- event type badge
- title/date/location
- attendance count
- payment requirement badge if applicable
- primary sticky CTA

- [ ] **Step 4: Align RSVP sheet steps**

Use `ProgressBar` for multi-step progress if the current flow has multiple steps.
Use `Cta` for primary/secondary actions.
Keep form fields and server action calls unchanged.

- [ ] **Step 5: Align proof/payment visual hierarchy**

In `my-payment-tab.tsx`:
- show method options as cards
- show upload/proof status as clear state card
- preserve existing upload and payment logic.

- [ ] **Step 6: Add locale keys**

Use existing public event namespace if present. Otherwise add `publicEvent` keys for:
- hero labels
- RSVP steps
- payment/proof states
- success copy

Update all four locale files.

- [ ] **Step 7: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/athlete-event-detail.tsx src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/athlete-rsvp-sheet.tsx src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/my-payment-tab.tsx src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/countdown-timer.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
pnpm build
```

Expected: passes.

- [ ] **Step 8: Visual smoke**

Open `/event/<known-id>`.

Expected:
- Public hero matches v3 density.
- Guest RSVP form is usable.
- Payment/proof step is reachable when event requires payment.
- No auth-only controls appear for guests.

- [ ] **Step 9: Commit**

```bash
git add src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/athlete-event-detail.tsx src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/athlete-rsvp-sheet.tsx src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/my-payment-tab.tsx src/app/'(mobile)'/'(athlete)'/event/'[id]'/_components/countdown-timer.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] align v3 public event invite flow"
```

---

## Task 7: Payments v3 History, Config, Proof Flow

**Files:**
- Modify: `src/app/(mobile)/(protected)/arena/payments/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/payments/[id]/page.tsx`
- Modify: `src/components/arena/payment-settings-sheet.tsx`
- Modify: `src/components/arena/payment-method-card.tsx`
- Modify: `src/components/arena/manual-mark-paid-sheet.tsx`
- Create: `src/components/arena/proof-review-sheet.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect current payments files**

Run:

```bash
sed -n '1,360p' src/app/'(mobile)'/'(protected)'/arena/payments/page.tsx
sed -n '1,320p' src/app/'(mobile)'/'(protected)'/arena/payments/'[id]'/page.tsx
sed -n '1,320p' src/components/arena/payment-settings-sheet.tsx
```

Expected: identify active methods, settings sheet, payment list, and detail route.

- [ ] **Step 2: Remove touched-file lint debt**

In `payments/page.tsx`, remove unused imports/variables already flagged by Biome when touching the file:
- `Clock` if unused
- `METHOD_META` if unused

- [ ] **Step 3: Add `history/config` segmented tabs**

Use `SegmentedControl` with:
- `history`: payment list/stats
- `config`: active methods/config summary

Default to `history`.

- [ ] **Step 4: Add stats strip using `MetricCard`**

Stats:
- total expected/charged if computable from `payments`
- paid count/value
- awaiting count
- overdue count

If value is unavailable, use count only; do not invent money totals.

- [ ] **Step 5: Add payment state filters**

Filter options:
- all
- paid
- awaiting/pending
- overdue

Use existing `JbBadge` or `SegmentedControl` depending on density.

- [ ] **Step 6: Create `ProofReviewSheet`**

API:

```tsx
type ProofReviewSheetProps = {
  payment: Payment;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
};
```

If approve/reject actions are not available in existing hooks/actions, render disabled buttons with copy from locale. Do not create new server actions.

- [ ] **Step 7: Align method settings cards**

In `payment-settings-sheet.tsx` and `payment-method-card.tsx`:
- keep current fields
- use v3 method cards with icon, active badge, detail line
- no hardcoded copy outside locale files

- [ ] **Step 8: Add locale keys**

Under `arenaPayments.v3`:

```json
{
  "tabs": {
    "history": "Historico",
    "config": "Configurar"
  },
  "stats": {
    "total": "Total",
    "paid": "Pago",
    "awaiting": "A validar",
    "overdue": "Em atraso"
  },
  "filters": {
    "all": "Todos",
    "paid": "Pagos",
    "awaiting": "A validar",
    "overdue": "Atrasados"
  },
  "proof": {
    "title": "Comprovativo",
    "approve": "Aprovar",
    "reject": "Rejeitar",
    "unavailable": "Validacao ainda indisponivel"
  }
}
```

Translate in `en/es/fr`.

- [ ] **Step 9: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/app/'(mobile)'/'(protected)'/arena/payments/page.tsx src/app/'(mobile)'/'(protected)'/arena/payments/'[id]'/page.tsx src/components/arena/payment-settings-sheet.tsx src/components/arena/payment-method-card.tsx src/components/arena/manual-mark-paid-sheet.tsx src/components/arena/proof-review-sheet.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
pnpm build
```

Expected: passes.

- [ ] **Step 10: Visual smoke**

Open `/arena/payments`.

Expected:
- History/config tabs work.
- Stats cards fit at 390px.
- Filters do not overflow.
- Settings sheet opens and retains existing save behavior.

- [ ] **Step 11: Commit**

```bash
git add src/app/'(mobile)'/'(protected)'/arena/payments/page.tsx src/app/'(mobile)'/'(protected)'/arena/payments/'[id]'/page.tsx src/components/arena/payment-settings-sheet.tsx src/components/arena/payment-method-card.tsx src/components/arena/manual-mark-paid-sheet.tsx src/components/arena/proof-review-sheet.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] align v3 payments flow"
```

---

## Task 8: Profile/Equipa Hub And Settings Sheets

**Files:**
- Modify: `src/app/(mobile)/(protected)/arena/profile/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/profile/_components/profile-form.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/settings/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/settings/_components/settings-form.tsx`
- Create: `src/components/arena/team-management-sheet.tsx`
- Create: `src/components/arena/security-sheet.tsx`
- Create: `src/components/arena/plan-sheet.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect current profile/settings data contracts**

Run:

```bash
sed -n '1,260p' src/app/'(mobile)'/'(protected)'/arena/profile/page.tsx
sed -n '1,320p' src/app/'(mobile)'/'(protected)'/arena/profile/_components/profile-form.tsx
sed -n '1,260p' src/app/'(mobile)'/'(protected)'/arena/settings/_components/settings-form.tsx
```

Expected: know what data/actions are available.

- [ ] **Step 2: Convert profile page layout to v3 hub**

Keep server auth/session load. Render:
- hero with avatar/name/email/verified badge
- compact user stats if reliable data exists; otherwise omit stats rather than fake them
- account card
- preferences/action list
- danger zone remains accessible but visually less dominant

- [ ] **Step 3: Add sheet state client boundary if needed**

If `profile/page.tsx` is server-only, create:

```tsx
src/app/(mobile)/(protected)/arena/profile/_components/profile-hub-client.tsx
```

Pass serialized session/profile data into it.

- [ ] **Step 4: Create `TeamManagementSheet`**

API:

```tsx
type TeamManagementSheetProps = {
  teamName: string;
  onClose: () => void;
};
```

Visual sections:
- admins
- transfer ownership placeholder if no action exists
- delete team confirmation placeholder if no action exists

Do not implement destructive team actions unless existing server actions are present and already used elsewhere.

- [ ] **Step 5: Create `SecuritySheet`**

Visual sections:
- passkeys
- sessions
- 2FA

Use existing passkey call sites if available; otherwise render informational states.

- [ ] **Step 6: Create `PlanSheet`**

Visual-only plan comparison:
- current plan badge
- free/pro/champion cards
- disabled upgrade CTA if billing action does not exist

- [ ] **Step 7: Align settings form controls**

Use v3 toggle visual density:
- language selector
- notification toggle

Keep existing save action.

- [ ] **Step 8: Add locale keys**

Under `profilePage.v3`:

```json
{
  "actions": {
    "editProfile": "Editar perfil",
    "team": "Gerir equipa",
    "notifications": "Notificacoes",
    "security": "Seguranca",
    "plan": "Plano e faturacao",
    "settings": "Definicoes"
  },
  "teamSheet": {
    "title": "Gerir equipa",
    "admins": "Administradores",
    "transfer": "Transferir propriedade",
    "delete": "Excluir equipa"
  },
  "securitySheet": {
    "title": "Seguranca",
    "passkeys": "Passkeys",
    "sessions": "Sessoes",
    "twoFactor": "2FA"
  },
  "planSheet": {
    "title": "Plano e faturacao",
    "current": "Atual",
    "upgradeUnavailable": "Upgrade indisponivel no MVP"
  }
}
```

Translate in `en/es/fr`.

- [ ] **Step 9: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/app/'(mobile)'/'(protected)'/arena/profile/page.tsx src/app/'(mobile)'/'(protected)'/arena/profile/_components/profile-form.tsx src/app/'(mobile)'/'(protected)'/arena/settings/page.tsx src/app/'(mobile)'/'(protected)'/arena/settings/_components/settings-form.tsx src/components/arena/team-management-sheet.tsx src/components/arena/security-sheet.tsx src/components/arena/plan-sheet.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
pnpm build
```

Expected: passes.

- [ ] **Step 10: Visual smoke**

Open `/arena/profile` and `/arena/settings`.

Expected:
- Profile reads as v3 `equipa` hub.
- Sheets open/close smoothly.
- No destructive action can be triggered accidentally.
- Existing profile/settings save flows still work.

- [ ] **Step 11: Commit**

```bash
git add src/app/'(mobile)'/'(protected)'/arena/profile/page.tsx src/app/'(mobile)'/'(protected)'/arena/profile/_components/profile-form.tsx src/app/'(mobile)'/'(protected)'/arena/settings/page.tsx src/app/'(mobile)'/'(protected)'/arena/settings/_components/settings-form.tsx src/components/arena/team-management-sheet.tsx src/components/arena/security-sheet.tsx src/components/arena/plan-sheet.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] build v3 profile hub"
```

---

## Task 9: Rankings And History Routes

**Files:**
- Create: `src/app/(mobile)/(protected)/arena/rankings/page.tsx`
- Create: `src/app/(mobile)/(protected)/arena/history/page.tsx`
- Modify: `src/components/arena/sidebar.tsx`
- Modify: `src/components/arena/desktop-sidebar.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Find available team/player/event data sources**

Run:

```bash
rg -n "useTeams|usePlayers|usePayments|get.*Event|get.*Player|get.*Stats|getCalendarEvents|PlayerRow" src/hooks src/actions src/db src/app/'(mobile)'/'(protected)'/arena
```

Expected: identify whether rankings/history can use real hooks or must start with empty states.

- [ ] **Step 2: Implement rankings page**

Render:
- `ScreenHeader` title
- `SegmentedControl` tabs: league, scorers, assists
- list rows using `JbAvatar`, `JbBadge`, `MetricCard` where possible
- `ArenaEmptyState` if no data source exists

Do not hardcode fake league data in production route.

- [ ] **Step 3: Implement history page**

Render:
- seasons list if data source exists
- recent matches list using `EventRow`
- `ArenaEmptyState` if no historical data source exists

- [ ] **Step 4: Add navigation entries**

Add rankings/history to desktop sidebar only. Do not overload mobile bottom nav beyond five items.

- [ ] **Step 5: Add locale keys**

Add `arenaRankings` and `arenaHistory` namespaces in all locales.

Minimum keys:

```json
{
  "arenaRankings": {
    "title": "Rankings",
    "tabs": {
      "league": "Liga",
      "scorers": "Marcadores",
      "assists": "Assistencias"
    },
    "empty": {
      "title": "Sem rankings",
      "description": "Os rankings aparecem quando houver jogos registados."
    }
  },
  "arenaHistory": {
    "title": "Historico",
    "seasons": "Epocas",
    "recent": "Recentes",
    "empty": {
      "title": "Sem historico",
      "description": "O historico aparece quando houver eventos terminados."
    }
  }
}
```

Translate in `en/es/fr`.

- [ ] **Step 6: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/app/'(mobile)'/'(protected)'/arena/rankings/page.tsx src/app/'(mobile)'/'(protected)'/arena/history/page.tsx src/components/arena/sidebar.tsx src/components/arena/desktop-sidebar.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
pnpm build
```

Expected: passes.

- [ ] **Step 7: Visual smoke**

Open:
- `/arena/rankings`
- `/arena/history`

Expected:
- Pages render behind auth.
- Empty/data states are polished and localized.
- Desktop/sidebar links work if visible.

- [ ] **Step 8: Commit**

```bash
git add src/app/'(mobile)'/'(protected)'/arena/rankings/page.tsx src/app/'(mobile)'/'(protected)'/arena/history/page.tsx src/components/arena/sidebar.tsx src/components/arena/desktop-sidebar.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] add v3 rankings and history routes"
```

---

## Task 10: Auth And Onboarding Final v3 Polish

**Files:**
- Modify: `src/app/(mobile)/auth/page.tsx`
- Modify: `src/app/(mobile)/(protected)/onboarding/_components/onboarding-client.tsx`
- Modify: `src/app/(mobile)/(protected)/onboarding/_components/survey-step.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Inspect current auth/onboarding against v3 source**

Run:

```bash
sed -n '1,360p' src/app/'(mobile)'/auth/page.tsx
sed -n '1,380p' src/app/'(mobile)'/'(protected)'/onboarding/_components/onboarding-client.tsx
sed -n '1,260p' src/app/'(mobile)'/'(protected)'/onboarding/_components/survey-step.tsx
```

Expected: identify remaining visual-only gaps.

- [ ] **Step 2: Preserve all auth handlers**

Do not change:
- `requestAuthSignInOTP`
- `signIn.emailOtp`
- `signIn.social`
- `signIn.passkey`
- callback URL safety logic

- [ ] **Step 3: Apply v3 login visual refinements**

Allowed changes:
- shield/logo hero treatment
- passkey button loading animation
- improved card spacing
- arena token-only focus states
- `Cta` for primary form action if it does not break submit semantics

- [ ] **Step 4: Audit onboarding 8-step parity**

Check current onboarding against v3:
- welcome/progress
- role/journey selection
- detail/survey
- setup steps
- sticky CTA

If current product intentionally has fewer steps, document the difference in `DESIGN.md` rather than adding fake steps.

- [ ] **Step 5: Verify locale keys**

Ensure all visible hardcoded auth/onboarding copy is in `authPage` or `onboarding`.

- [ ] **Step 6: Verify task**

Run:

```bash
pnpm exec tsc --noEmit
pnpm exec biome check src/app/'(mobile)'/auth/page.tsx src/app/'(mobile)'/'(protected)'/onboarding/_components/onboarding-client.tsx src/app/'(mobile)'/'(protected)'/onboarding/_components/survey-step.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
pnpm build
```

Expected: passes.

- [ ] **Step 7: Visual smoke**

Open:
- `/auth`
- `/auth?mode=register`
- `/onboarding`

Expected:
- Auth form remains functional.
- Onboarding still saves role/survey.
- Mobile layout fits 390px width.

- [ ] **Step 8: Commit**

```bash
git add src/app/'(mobile)'/auth/page.tsx src/app/'(mobile)'/'(protected)'/onboarding/_components/onboarding-client.tsx src/app/'(mobile)'/'(protected)'/onboarding/_components/survey-step.tsx src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json
git commit -m "[PR9] polish v3 auth and onboarding"
```

---

## Task 11: Documentation And Final Flow Audit

**Files:**
- Modify: `DESIGN.md`
- Modify: `docs/superpowers/plans/2026-05-23-v3-interface-flow-improvements.md` if implementation discoveries require updating this plan.

- [ ] **Step 1: Update `DESIGN.md` v3 flow map**

Add a concise section:
- source file path
- implemented route mapping
- intentional deviations
- shared component list
- mobile verification viewport: `390x844`

- [ ] **Step 2: Record intentional omissions**

Examples:
- no fake OTP acceptance
- no fake billing upgrades
- no destructive team actions without existing server actions
- no hardcoded rankings if no data source exists

- [ ] **Step 3: Run final verification**

Run:

```bash
pnpm exec tsc --noEmit
pnpm build
node -e "for (const f of ['pt','en','es','fr']) JSON.parse(require('fs').readFileSync(`src/locales/${f}.json`, 'utf8')); console.log('locale json ok')"
```

Expected: all pass.

- [ ] **Step 4: Run targeted Biome for all touched files**

Use:

```bash
git diff --name-only release02...HEAD | tr '\n' ' '
```

Then run:

```bash
pnpm exec biome check <all touched ts/tsx/json/css/md files>
```

Expected: passes for touched files.

- [ ] **Step 5: Visual regression sweep**

Open mobile viewport `390x844`:
- `/auth`
- `/onboarding`
- `/arena`
- `/arena/events`
- `/arena/calendar`
- `/arena/events/<known-id>`
- `/event/<known-id>`
- `/arena/squads`
- `/arena/payments`
- `/arena/profile`
- `/arena/rankings`
- `/arena/history`

Expected:
- no overlapping text
- no horizontal scrolling
- sticky nav/CTA does not cover critical controls
- sheets open/close and trap focus where underlying component supports it

- [ ] **Step 6: Commit**

```bash
git add DESIGN.md docs/superpowers/plans/2026-05-23-v3-interface-flow-improvements.md
git commit -m "[PR9] document v3 interface flow mapping"
```

---

## Implementation Notes For Workers

- Use `@superpowers:executing-plans` for inline execution or `@superpowers:subagent-driven-development` if parallel task workers are allowed.
- Use `@superpowers:verification-before-completion` before every completion claim.
- Use the Browser plugin for local visual checks after frontend changes.
- Prefer targeted Biome checks because global `pnpm lint` has known pre-existing failures at plan time.
- Keep commits atomic with `[PR9]` prefix unless the release manager assigns a different PR number.
- If a task discovers that a v3 flow requires missing domain actions, stop at polished read-only/disabled UI and document the missing backend contract instead of inventing persistence.
