# shadcn/ui Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all raw `<button>`, `<input>`, `<select>`, `<textarea>` elements outside `src/components/ui/` with shadcn primitives, and adopt proper Tabs / ToggleGroup semantics where applicable.

**Architecture:** Surgical per-file replacements preserving all existing classNames. Raw elements are wrapped or replaced 1-to-1 — no behavioral changes. Two new shadcn components (toggle, toggle-group) are installed to upgrade filter chips to ToggleGroup and tabs to shadcn Tabs.

**Tech Stack:** Next.js 15 App Router, shadcn/ui (new-york style), Radix UI, Tailwind v4, pnpm, TypeScript

---

## Files Modified

| File | Change |
|---|---|
| `src/components/ui/toggle.tsx` | Created by shadcn install |
| `src/components/ui/toggle-group.tsx` | Created by shadcn install |
| `src/components/animate-button.tsx` | `<button>` → shadcn `<Button>` |
| `src/app/(public)/(website)/page.tsx` | 1× `<button>` → `<Button>` |
| `src/app/(protected)/arena/notifications/_components/notifications-list.tsx` | `<button>` rows → `<Button variant="ghost">` |
| `src/app/(protected)/arena/teams/_components/squad-client.tsx` | `<input>` → `<Input>`, filter chips → `<ToggleGroup>` |
| `src/app/(protected)/arena/events/[id]/_components/event-detail-client.tsx` | custom tab buttons → shadcn `<Tabs>` |
| `src/app/(public)/auth/page.tsx` | 7× `<button>` → `<Button>`, 2× `<input>` → `<Input>` |

---

## Task 1: Install toggle and toggle-group

**Files:**
- Create: `src/components/ui/toggle.tsx`
- Create: `src/components/ui/toggle-group.tsx`

- [ ] **Step 1: Run shadcn install**

```bash
pnpm dlx shadcn@latest add toggle toggle-group
```

Expected: two new files created in `src/components/ui/`.

- [ ] **Step 2: Verify files created**

```bash
ls src/components/ui/toggle.tsx src/components/ui/toggle-group.tsx
```

Expected: both paths print without error.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/toggle.tsx src/components/ui/toggle-group.tsx
git commit -m "chore: install shadcn toggle and toggle-group components"
```

---

## Task 2: Migrate animate-button.tsx

**Files:**
- Modify: `src/components/animate-button.tsx`

Replace the raw `<button>` with shadcn `<Button>`. The animation spans stay as children — shadcn Button renders a `<button>` element and passes children through, so the animation works unchanged.

- [ ] **Step 1: Update animate-button.tsx**

Replace the entire file content:

```tsx
"use client";
import { MoveRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ArrowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  textColor?: string;
  buttonOverlayColor?: string;
  borderColor?: string;
  iconColor?: string;
  className?: string;
}

export default function ArrowButton({
  text = "Open",
  textColor = "#bf49ff",
  buttonOverlayColor = "#bf49ff",
  borderColor = "#c284f9",
  iconColor = "white",
  className,
  ...props
}: ArrowButtonProps) {
  return (
    <Button
      variant="outline"
      style={{ borderColor: borderColor }}
      {...props}
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-purple-400 bg-background px-6 py-3 font-medium shadow-md transition duration-300 ease-out",
        className,
      )}
    >
      <span
        style={{ background: buttonOverlayColor }}
        className={cn(
          "ease absolute inset-0 flex h-full w-full -translate-x-full items-center justify-center bg-purple-400 text-white duration-300 group-hover:translate-x-0",
        )}
      >
        <MoveRight style={{ color: iconColor }} />
      </span>
      <span
        style={{ color: textColor }}
        className={cn(
          "absolute flex h-full w-full transform items-center justify-center font-bold transition-all duration-300 ease-in-out group-hover:translate-x-full",
        )}
      >
        {text}
      </span>
      <span className="invisible relative">Button</span>
    </Button>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
pnpm ts-check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/animate-button.tsx
git commit -m "refactor: migrate animate-button to use shadcn Button"
```

---

## Task 3: Migrate website page explore button

**Files:**
- Modify: `src/app/(public)/(website)/page.tsx`

One raw `<button>` at line ~325 inside `EcosystemSection` (renders inside a `motion.div` per module). Replace with `<Button>`.

- [ ] **Step 1: Add Button import**

In `src/app/(public)/(website)/page.tsx`, `Button` is already imported:
```tsx
import { Button } from "@/components/ui/button";
```
Verify it's there. If missing, add it to the import block.

- [ ] **Step 2: Replace the explore button**

Find:
```tsx
<button className="flex items-center gap-2 text-xs font-bold tracking-widest text-blue-400 uppercase transition-colors hover:text-blue-300">
  {t("modules.explore")} <ArrowRight className="h-4 w-4" />
</button>
```

Replace with:
```tsx
<Button
  variant="ghost"
  size="sm"
  className="flex items-center gap-2 p-0 text-xs font-bold tracking-widest text-blue-400 uppercase transition-colors hover:bg-transparent hover:text-blue-300"
>
  {t("modules.explore")} <ArrowRight className="h-4 w-4" />
</Button>
```

- [ ] **Step 3: TypeScript check**

```bash
pnpm ts-check
```

Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(public)/(website)/page.tsx"
git commit -m "refactor: replace raw explore button with shadcn Button on website page"
```

---

## Task 4: Migrate notifications-list.tsx button rows

**Files:**
- Modify: `src/app/(protected)/arena/notifications/_components/notifications-list.tsx`

The notification rows are rendered as `<button>` elements (clickable cards). Replace with `<Button variant="ghost">` while preserving all inner structure and classNames.

- [ ] **Step 1: Replace notification row button**

Find (lines 119–177):
```tsx
<button
  type="button"
  key={notification.id}
  onClick={() =>
    !notification.read && handleMarkAsRead(notification.id)
  }
  className={cn(
    "jb-card group relative flex w-full gap-4 border-l-4 p-4 text-left transition-all duration-200",
    notification.read
      ? "border-transparent opacity-70"
      : "border-arena-primary bg-arena-surface-el/20 hover:bg-arena-surface-el/30",
  )}
>
  {/* ... inner content ... */}
</button>
```

Replace with:
```tsx
<Button
  type="button"
  key={notification.id}
  variant="ghost"
  onClick={() =>
    !notification.read && handleMarkAsRead(notification.id)
  }
  className={cn(
    "jb-card group relative h-auto w-full gap-4 border-l-4 p-4 text-left transition-all duration-200",
    notification.read
      ? "border-transparent opacity-70 hover:bg-transparent"
      : "border-arena-primary bg-arena-surface-el/20 hover:bg-arena-surface-el/30",
  )}
>
  {/* ... inner content unchanged ... */}
</Button>
```

Note: `h-auto` overrides shadcn Button's default fixed height. `hover:bg-transparent` is added to the read state to suppress shadcn's default ghost hover.

- [ ] **Step 2: TypeScript check**

```bash
pnpm ts-check
```

Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(protected)/arena/notifications/_components/notifications-list.tsx"
git commit -m "refactor: replace raw button rows with shadcn Button in notifications list"
```

---

## Task 5: Migrate squad-client.tsx (search input + filter chips)

**Files:**
- Modify: `src/app/(protected)/arena/teams/_components/squad-client.tsx`

Two changes: `<input>` search → shadcn `<Input>`, filter chip `<button>` loop → shadcn `<ToggleGroup>`.

- [ ] **Step 1: Add ToggleGroup imports**

At the top of `squad-client.tsx`, the file already imports `Input` from `@/components/ui/input`. Add the ToggleGroup imports:

```tsx
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
```

- [ ] **Step 2: Replace search input**

Find:
```tsx
<input
  value={search}
  onChange={e => setSearch(e.target.value)}
  placeholder={t("search.placeholder")}
  className="flex-1 bg-transparent text-sm text-arena-text placeholder:text-arena-text-muted/70 outline-none"
/>
```

Replace with:
```tsx
<Input
  value={search}
  onChange={e => setSearch(e.target.value)}
  placeholder={t("search.placeholder")}
  className="flex-1 border-none bg-transparent p-0 text-sm text-arena-text shadow-none placeholder:text-arena-text-muted/70 focus-visible:ring-0"
/>
```

Note: `border-none`, `p-0`, `shadow-none`, `focus-visible:ring-0` remove shadcn Input's default border/ring since the wrapper div already handles the border.

- [ ] **Step 3: Replace filter chip buttons with ToggleGroup**

Find:
```tsx
{/* Filter chips */}
<div className="jb-toolbar mt-2.5 pb-1">
  {FILTERS_DATA.map(f => (
    <button
      key={f.id}
      onClick={() => setFilter(f.id)}
      className={`jb-chip ${filter === f.id ? "jb-chip-active" : ""}`}
      type="button"
    >
      {t(f.l)}
    </button>
  ))}
</div>
```

Replace with:
```tsx
{/* Filter chips */}
<ToggleGroup
  type="single"
  value={filter}
  onValueChange={v => v && setFilter(v)}
  className="jb-toolbar mt-2.5 pb-1 justify-start"
>
  {FILTERS_DATA.map(f => (
    <ToggleGroupItem
      key={f.id}
      value={f.id}
      className="jb-chip h-auto data-[state=on]:border-arena-primary/40 data-[state=on]:bg-arena-primary/8 data-[state=on]:text-arena-primary"
    >
      {t(f.l)}
    </ToggleGroupItem>
  ))}
</ToggleGroup>
```

Notes:
- `onValueChange={v => v && setFilter(v)}` — the guard `v && ...` prevents deselection (ToggleGroup allows clicking active item to deselect, guard keeps filter always set)
- `jb-chip` provides base styles (border, bg, padding, font-size)
- `h-auto` overrides ToggleGroupItem default fixed height
- `data-[state=on]:*` applies active styles when toggled on

- [ ] **Step 4: TypeScript check**

```bash
pnpm ts-check
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(protected)/arena/teams/_components/squad-client.tsx"
git commit -m "refactor: migrate squad search input to shadcn Input and filter chips to ToggleGroup"
```

---

## Task 6: Migrate event-detail-client.tsx tabs

**Files:**
- Modify: `src/app/(protected)/arena/events/[id]/_components/event-detail-client.tsx`

Replace the manual tab button loop + conditional content rendering with shadcn `<Tabs>`. The `tab` state drives `Tabs value` prop; the content panels become `<TabsContent>`.

**Important:** The project's custom `Tabs` component (in `src/components/ui/tabs.tsx`) has an internal `onValueChange` that sets `window.location.hash`. Since props are spread after, passing `onValueChange` in our usage overrides that behavior — controlled state works correctly.

- [ ] **Step 1: Add Tabs imports**

In `event-detail-client.tsx`, add to existing imports:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

- [ ] **Step 2: Replace tab section**

Find and replace the entire tab bar + content div block.

**Remove** (lines 153–287, the tab `<div>` and content `<div>`):
```tsx
{/* ── Tabs ───────────────────────────────────────────── */}
<div className="flex shrink-0 border-b border-arena-border">
  {TABS_DATA.map(tab_item => {
    const Icon = tab_item.icon;
    const isActive = tab === tab_item.id;
    return (
      <button
        key={tab_item.id}
        onClick={() => setTab(tab_item.id)}
        type="button"
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 border-b-2 py-[11px] text-[12px] transition-colors",
          isActive
            ? "border-arena-primary font-bold text-arena-primary"
            : "border-transparent font-medium text-arena-text-muted hover:text-arena-text-sec",
        )}
        style={{ marginBottom: -1 }}
      >
        <Icon size={13} />
        {tab_item.label}
      </button>
    );
  })}
</div>

{/* ── Scrollable content ─────────────────────────────── */}
<div className="flex-1 overflow-auto pb-20">
  {tab === "conv" && (
    <div className="px-5 py-3.5">
      {/* ... conv content ... */}
    </div>
  )}

  {tab === "local" && (
    <div className="px-5 py-3.5">
      {/* ... local content ... */}
    </div>
  )}
</div>
```

**Replace with:**
```tsx
{/* ── Tabs ───────────────────────────────────────────── */}
<Tabs
  value={tab}
  onValueChange={v => setTab(v as Tab)}
  className="flex flex-1 flex-col"
>
  <TabsList className="flex h-auto w-full shrink-0 rounded-none border-b border-arena-border bg-transparent p-0">
    {TABS_DATA.map(tab_item => {
      const Icon = tab_item.icon;
      return (
        <TabsTrigger
          key={tab_item.id}
          value={tab_item.id}
          className="-mb-px flex flex-1 items-center justify-center gap-1.5 rounded-none border-b-2 border-transparent py-[11px] text-[12px] font-medium text-arena-text-muted transition-colors hover:text-arena-text-sec data-[state=active]:border-arena-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-arena-primary data-[state=active]:shadow-none"
        >
          <Icon size={13} />
          {tab_item.label}
        </TabsTrigger>
      );
    })}
  </TabsList>

  <TabsContent value="conv" className="mt-0 flex-1 overflow-auto pb-20">
    <div className="px-5 py-3.5">
      {/* Confirmed list */}
      <div className="jb-section-label pb-2">
        {t("lists.main", { count: MOCK_CONFIRMED.length })}
      </div>
      <div className="mb-3.5 flex flex-col">
        {MOCK_CONFIRMED.map((p, i) => (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-2.5 border border-arena-border bg-arena-surface px-3.5 py-2.5",
              i === 0
                ? "rounded-t-[14px] rounded-b-[4px]"
                : i === MOCK_CONFIRMED.length - 1
                  ? "rounded-t-[4px] rounded-b-[14px] border-t-0"
                  : "rounded-[4px] border-t-0",
            )}
          >
            <span className="w-5 text-center text-[11px] font-bold text-arena-text-muted">
              {i + 1}
            </span>
            <JbAvatar name={p.name} size={30} id={p.id} />
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-arena-text">
                {p.name}
              </div>
              <div className="text-[10px] text-arena-text-muted">
                {p.role}
              </div>
            </div>
            <Check size={15} className="text-arena-success" strokeWidth={2.5} />
          </div>
        ))}
      </div>

      {/* Reserves + Pending list */}
      <div className="jb-section-label pb-2">
        {t("lists.reserves", {
          count: MOCK_RESERVES.length + MOCK_PENDING.length,
        })}
      </div>
      <div className="flex flex-col">
        {[
          ...MOCK_RESERVES.map(p => ({ ...p, status: "reserve" as const })),
          ...MOCK_PENDING.map(p => ({ ...p, status: "pending" as const })),
        ].map((p, i, arr) => (
          <div
            key={p.id}
            className={cn(
              "flex items-center gap-2.5 border border-arena-border bg-arena-surface px-3.5 py-2.5 opacity-80",
              i === 0
                ? "rounded-t-[14px] rounded-b-[4px]"
                : i === arr.length - 1
                  ? "rounded-t-[4px] rounded-b-[14px] border-t-0"
                  : "rounded-[4px] border-t-0",
            )}
          >
            <JbAvatar name={p.name} size={30} id={p.id} />
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-arena-text">
                {p.name}
              </div>
              <div className="text-[10px] text-arena-text-muted">
                {p.role}
              </div>
            </div>
            <JbBadge status={p.status} />
          </div>
        ))}
      </div>
    </div>
  </TabsContent>

  <TabsContent value="local" className="mt-0 flex-1 overflow-auto pb-20">
    <div className="px-5 py-3.5">
      <div className="mb-3.5 overflow-hidden rounded-[16px] border border-arena-border bg-arena-surface">
        {/* Map placeholder */}
        <div className="flex h-24 items-center justify-center bg-arena-bg-sec">
          <MapPin size={32} className="text-arena-primary" />
        </div>
        <div className="px-3.5 py-3">
          <div className="mb-2.5 text-[13px] font-semibold text-arena-text">
            {event.location}
          </div>
          <div className="flex gap-1.5">
            <Link
              href={`https://www.google.com/maps/search/${encodeURIComponent(event.location)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 flex-1 items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el text-[12px] font-semibold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
            >
              Google Maps
            </Link>
            <Link
              href={`https://maps.apple.com/?q=${encodeURIComponent(event.location)}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-9 flex-1 items-center justify-center rounded-[10px] border border-arena-border bg-arena-surface-el text-[12px] font-semibold text-arena-text-sec no-underline transition-colors hover:bg-arena-surface hover:text-arena-text"
            >
              Apple Maps
            </Link>
          </div>
        </div>
      </div>
    </div>
  </TabsContent>
</Tabs>
```

- [ ] **Step 3: Remove now-unused `tab` state and `setTab`**

The `tab` state is still used — it drives `Tabs value`. Keep it. But verify `useState<Tab>` is still imported and used correctly.

The type `Tab = "conv" | "local"` at line 61 stays unchanged.

- [ ] **Step 4: TypeScript check**

```bash
pnpm ts-check
```

Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(protected)/arena/events/[id]/_components/event-detail-client.tsx"
git commit -m "refactor: migrate event detail tabs to shadcn Tabs component"
```

---

## Task 7: Migrate auth/page.tsx

**Files:**
- Modify: `src/app/(public)/auth/page.tsx`

Most impactful task. 7× `<button>` and 2× `<input>` replaced. All existing classNames preserved — the dark-glass aesthetic is intentional.

- [ ] **Step 1: Add Button and Input imports**

In `src/app/(public)/auth/page.tsx`, add after existing imports:
```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
```

- [ ] **Step 2: Replace method selector button (line ~209)**

Find:
```tsx
<button
  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
    selectedMethod === method.id
      ? "bg-white/18 text-white"
      : "text-white/60 hover:bg-white/8 hover:text-white"
  }`}
  key={method.id}
  onClick={() => {
    setSelectedMethod(method.id);
    if (method.id === "social") setStep("email");
  }}
  type="button"
>
```

Replace with:
```tsx
<Button
  variant="ghost"
  className={`flex h-auto w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
    selectedMethod === method.id
      ? "bg-white/18 text-white hover:bg-white/18"
      : "text-white/60 hover:bg-white/8 hover:text-white"
  }`}
  key={method.id}
  onClick={() => {
    setSelectedMethod(method.id);
    if (method.id === "social") setStep("email");
  }}
  type="button"
>
```

Note: `h-auto` prevents shadcn's default fixed height from squishing the button.

- [ ] **Step 3: Replace Google login button (line ~248)**

Find:
```tsx
<button
  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.08em] text-white transition-all hover:bg-white/18 disabled:opacity-50"
  disabled={loading}
  onClick={handleGoogleLogin}
  type="button"
>
```

Replace with:
```tsx
<Button
  variant="outline"
  className="flex h-auto w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.08em] text-white transition-all hover:bg-white/18 hover:text-white disabled:opacity-50"
  disabled={loading}
  onClick={handleGoogleLogin}
  type="button"
>
```

- [ ] **Step 4: Replace Apple login button (line ~262)**

Find:
```tsx
<button
  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.08em] text-white transition-all hover:bg-white/18 disabled:opacity-50"
  disabled={loading}
  onClick={handleAppleLogin}
  type="button"
>
```

Replace with:
```tsx
<Button
  variant="outline"
  className="flex h-auto w-full items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.08em] text-white transition-all hover:bg-white/18 hover:text-white disabled:opacity-50"
  disabled={loading}
  onClick={handleAppleLogin}
  type="button"
>
```

- [ ] **Step 5: Replace email input (line ~295)**

Find:
```tsx
<input
  {...emailForm.register("email")}
  autoComplete="email"
  className="h-[47px] w-full rounded-xl border border-white/20 bg-white/10 px-4 pr-12 text-sm tracking-[0.04em] text-white placeholder-white/40 outline-none transition-all focus:border-white/40 focus:bg-white/13"
  placeholder="pp@pp.com"
  type="email"
/>
```

Replace with:
```tsx
<Input
  {...emailForm.register("email")}
  autoComplete="email"
  className="h-[47px] w-full rounded-xl border border-white/20 bg-white/10 px-4 pr-12 text-sm tracking-[0.04em] text-white placeholder:text-white/40 transition-all focus:border-white/40 focus:bg-white/13 focus-visible:ring-0 focus-visible:ring-offset-0"
  placeholder="pp@pp.com"
  type="email"
/>
```

Note: `placeholder-white/40` → `placeholder:text-white/40` (Tailwind v4 syntax). `focus-visible:ring-0 focus-visible:ring-offset-0` suppresses shadcn's default focus ring since the dark-glass focus uses `focus:border-white/40` instead.

- [ ] **Step 6: Replace email submit button (line ~302)**

Find:
```tsx
<button
  aria-label="Enviar código"
  className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
  disabled={loading}
  type="submit"
>
```

Replace with:
```tsx
<Button
  aria-label="Enviar código"
  className="absolute top-1/2 right-3 h-7 w-7 -translate-y-1/2 rounded-lg bg-white/20 p-0 text-white transition-colors hover:bg-white/30"
  disabled={loading}
  type="submit"
  size="icon"
>
```

- [ ] **Step 7: Replace back-to-email button (line ~331)**

Find:
```tsx
<button
  className="flex items-center gap-2 text-xs tracking-[0.06em] text-white/45 hover:text-white/70"
  onClick={() => setStep("email")}
  type="button"
>
  <ArrowLeft className="h-3.5 w-3.5" />
  {collectedEmail}
</button>
```

Replace with:
```tsx
<Button
  variant="ghost"
  size="sm"
  className="h-auto gap-2 p-0 text-xs tracking-[0.06em] text-white/45 hover:bg-transparent hover:text-white/70"
  onClick={() => setStep("email")}
  type="button"
>
  <ArrowLeft className="h-3.5 w-3.5" />
  {collectedEmail}
</Button>
```

- [ ] **Step 8: Replace OTP code input (line ~340)**

Find:
```tsx
<input
  {...codeForm.register("code")}
  autoComplete="one-time-code"
  className="h-[47px] w-full rounded-xl border border-white/20 bg-white/10 px-4 pr-12 text-center font-mono text-xl tracking-[0.5em] text-white outline-none transition-all placeholder:text-white/25 focus:border-white/40 focus:bg-white/13"
  inputMode="numeric"
  maxLength={6}
  placeholder="000000"
  ref={el => {
    codeForm.register("code").ref(el);
    codeInputRef.current = el;
  }}
  type="text"
/>
```

Replace with:
```tsx
<Input
  {...codeForm.register("code")}
  autoComplete="one-time-code"
  className="h-[47px] w-full rounded-xl border border-white/20 bg-white/10 px-4 pr-12 text-center font-mono text-xl tracking-[0.5em] text-white transition-all placeholder:text-white/25 focus:border-white/40 focus:bg-white/13 focus-visible:ring-0 focus-visible:ring-offset-0"
  inputMode="numeric"
  maxLength={6}
  placeholder="000000"
  ref={el => {
    codeForm.register("code").ref(el);
    codeInputRef.current = el;
  }}
  type="text"
/>
```

- [ ] **Step 9: Replace OTP submit button (line ~353)**

Find:
```tsx
<button
  aria-label="Validar código"
  className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg bg-white/20 text-white transition-colors hover:bg-white/30"
  disabled={loading}
  type="submit"
>
```

Replace with:
```tsx
<Button
  aria-label="Validar código"
  className="absolute top-1/2 right-3 h-7 w-7 -translate-y-1/2 rounded-lg bg-white/20 p-0 text-white transition-colors hover:bg-white/30"
  disabled={loading}
  type="submit"
  size="icon"
>
```

- [ ] **Step 10: Replace resend code button (line ~375)**

Find:
```tsx
<button
  className="mx-auto block text-xs text-white/45 underline underline-offset-4 hover:text-white/70"
  disabled={loading}
  onClick={() => requestCode({ email: collectedEmail })}
  type="button"
>
  Reenviar código
</button>
```

Replace with:
```tsx
<Button
  variant="ghost"
  size="sm"
  className="mx-auto flex h-auto p-0 text-xs text-white/45 underline underline-offset-4 hover:bg-transparent hover:text-white/70"
  disabled={loading}
  onClick={() => requestCode({ email: collectedEmail })}
  type="button"
>
  Reenviar código
</Button>
```

- [ ] **Step 11: TypeScript check**

```bash
pnpm ts-check
```

Expected: no new errors.

- [ ] **Step 12: Commit**

```bash
git add "src/app/(public)/auth/page.tsx"
git commit -m "refactor: migrate auth page raw buttons and inputs to shadcn Button and Input"
```

---

## Task 8: Final verification

- [ ] **Step 1: Run TypeScript check**

```bash
pnpm ts-check
```

Expected: zero errors.

- [ ] **Step 2: Verify no remaining raw elements outside ui/**

```bash
grep -rn "<button\b\|<input\b\|<select\b\|<textarea\b" src --include="*.tsx" | grep -v "src/components/ui/" | grep -v "node_modules"
```

Expected: zero results (or only results inside intentional wrappers in `src/components/ui/`).

- [ ] **Step 3: Build check**

```bash
pnpm build
```

Expected: build completes without errors.

- [ ] **Step 4: Commit verification summary**

```bash
git commit --allow-empty -m "chore: shadcn migration complete — all raw elements replaced"
```
