# shadcn/ui Migration Design

**Date:** 2026-04-30  
**Scope:** Replace raw HTML elements with shadcn components across all pages and shared components. Adopt proper shadcn semantics (Tabs, ToggleGroup) where applicable.

---

## Goal

Eliminate raw `<button>`, `<input>`, `<select>`, `<textarea>` elements outside `src/components/ui/`. Prefer shadcn primitives. Install missing components for UI patterns currently built with raw divs.

---

## Install

```bash
npx shadcn@latest add toggle toggle-group
```

No other installs needed — Button, Input, Tabs, Badge, Avatar, Sheet, Dialog, Dropdown, Select, Switch, Form, Label are already present.

---

## Component Mapping

### `src/app/(public)/auth/page.tsx`

| Raw element | Replace with | Notes |
|---|---|---|
| `<button>` method selector (line 209) | `<Button variant="ghost">` | Conditional className for active state (`bg-white/18 text-white` vs `text-white/60`) |
| `<button>` Google login (line 248) | `<Button variant="outline">` | Override: `border-white/20 bg-white/10 text-white hover:bg-white/18` |
| `<button>` Apple login (line 262) | `<Button variant="outline">` | Same override as Google |
| `<button>` submit email (line 302) | `<Button type="submit" size="icon">` | Keep absolute positioning classNames |
| `<button>` back to email (line 331) | `<Button variant="ghost" size="sm">` | |
| `<button>` submit OTP (line 353) | `<Button type="submit" size="icon">` | Keep absolute positioning classNames |
| `<button>` resend code (line 375) | `<Button variant="ghost" size="sm">` | |
| `<input>` email (line 295) | `<Input>` | Override: `bg-white/10 border-white/20 text-white placeholder-white/40` |
| `<input>` OTP code (line 340) | `<Input>` | Override: `font-mono text-xl tracking-[0.5em] text-center bg-white/10` |

All classNames preserved — dark-glass design is intentional and must not be reset by shadcn defaults.

### `src/app/(protected)/arena/teams/_components/squad-client.tsx`

| Raw element | Replace with | Notes |
|---|---|---|
| `<input>` search (line 230) | `<Input>` | `bg-transparent outline-none` — wrapper div handles border/bg |
| `<button>` filter chips (line 253) | `<ToggleGroup type="single">` + `<ToggleGroupItem>` | Map `filter` state → `value`; `onValueChange={v => v && setFilter(v)}` guards against deselect; apply `jb-chip` className or style directly |

### `src/app/(protected)/arena/events/[id]/_components/event-detail-client.tsx`

| Raw element | Replace with | Notes |
|---|---|---|
| `<button>` tab items (line 159) | shadcn `<Tabs>` + `<TabsList>` + `<TabsTrigger>` | `tab` state → `value`/`onValueChange`; content panels wrapped in `<TabsContent value="...">` |

State migration:
```tsx
<Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
  <TabsList>
    {TABS_DATA.map(t => (
      <TabsTrigger key={t.id} value={t.id}>
        <t.icon size={13} />
        {t.label}
      </TabsTrigger>
    ))}
  </TabsList>
  <TabsContent value="conv">...</TabsContent>
  <TabsContent value="squad">...</TabsContent>
</Tabs>
```

### `src/app/(protected)/arena/notifications/_components/notifications-list.tsx`

| Raw element | Replace with | Notes |
|---|---|---|
| `<button>` notification row (line 119) | `<Button variant="ghost">` | `w-full h-auto text-left p-0` to preserve card layout; keep all inner classNames |

### `src/app/(public)/(website)/page.tsx`

| Raw element | Replace with | Notes |
|---|---|---|
| `<button>` explore (line 325) | `<Button variant="ghost" size="sm">` | Keep `text-blue-400 uppercase tracking-widest hover:text-blue-300` classNames |

### `src/components/animate-button.tsx`

Refactor to use shadcn `Button` with `asChild` prop via Radix `Slot` so the animation spans render correctly:

```tsx
import { Button } from "@/components/ui/button";

export default function ArrowButton({ text, textColor, buttonOverlayColor, borderColor, iconColor, className, ...props }: ArrowButtonProps) {
  return (
    <Button
      variant="outline"
      style={{ borderColor }}
      className={cn("group relative inline-flex ... rounded-full ...", className)}
      {...props}
    >
      <span style={{ background: buttonOverlayColor }} className="ease absolute inset-0 ...">
        <MoveRight style={{ color: iconColor }} />
      </span>
      <span style={{ color: textColor }} className="absolute flex ...">
        {text}
      </span>
      <span className="invisible relative">Button</span>
    </Button>
  );
}
```

---

## Styling Strategy

- **Auth page**: All className overrides kept as-is. shadcn base styles are overridden via Tailwind merge (`cn()`). Dark-glass aesthetic is intentional.
- **Arena components**: Use existing arena CSS tokens (`arena-primary`, `arena-surface`, `arena-border`, `arena-text-muted`) on top of shadcn base classes.
- **ToggleGroup**: Apply `jb-chip` / `jb-chip-active` className to `<ToggleGroupItem>` if global CSS classes are sufficient; otherwise inline equivalent Tailwind.
- **Tabs in event-detail**: Override TabsTrigger to match existing `border-b-2` active style via className.

---

## Out of Scope

- `jb-*` Arena components (jb-avatar, jb-badge, jb-bottom-sheet) — V2 design system, not touching
- shadcn `<Form>` wrapper in auth page — forms already work with react-hook-form, adding Form layer adds complexity for no visual gain
- Any component inside `src/components/ui/` — already shadcn

---

## Files Changed

1. `src/app/(public)/auth/page.tsx`
2. `src/app/(protected)/arena/teams/_components/squad-client.tsx`
3. `src/app/(protected)/arena/events/[id]/_components/event-detail-client.tsx`
4. `src/app/(protected)/arena/notifications/_components/notifications-list.tsx`
5. `src/app/(public)/(website)/page.tsx`
6. `src/components/animate-button.tsx`

---

## Success Criteria

- Zero raw `<button>`, `<input>`, `<select>`, `<textarea>` outside `src/components/ui/` (excluding server components that render anchor/link elements)
- No visual regressions — all existing className overrides preserved
- TypeScript compiles with no new errors
- Tabs and ToggleGroup behavior identical to current custom implementations
