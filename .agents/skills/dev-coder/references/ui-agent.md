---
trigger: supporting_reference
---

# UI Agent - JogaBola MVP Arena

Use this reference when implementing or reviewing UI in the JogaBola MVP. The
current source of truth is the Arena v2 layout: dark operational app, green
primary accent, dense mobile-first screens, desktop sidebar, mobile bottom nav.

## Design Direction

- Tone: focused sports operations, not marketing page.
- Density: compact and scannable; avoid oversized hero sections inside app.
- Surfaces: dark panels with restrained borders.
- Accent: lime green for primary actions and active states.
- Secondary accents: blue/info, yellow/warning, red/danger, green/success.
- Motion: subtle, short, and useful.

## Token Contract

Define tokens once in `src/styles/globals.css` under `@theme`:

```css
--color-arena-bg: #0b0f14;
--color-arena-bg-sec: #111827;
--color-arena-surface: #151c26;
--color-arena-surface-el: #1b2430;
--color-arena-border: #263244;
--color-arena-text: #f5f7fa;
--color-arena-text-sec: #a7b0be;
--color-arena-text-muted: #6b7280;
--color-arena-primary: #7cff4f;
--color-arena-success: #22c55e;
--color-arena-warning: #f59e0b;
--color-arena-danger: #ef4444;
--color-arena-info: #38bdf8;
--color-arena-highlight: #facc15;
```

Use Tailwind utilities generated from these tokens:

- Backgrounds: `bg-arena-bg`, `bg-arena-bg-sec`, `bg-arena-surface`,
  `bg-arena-surface-el`
- Text: `text-arena-text`, `text-arena-text-sec`, `text-arena-text-muted`
- Borders: `border-arena-border`
- Actions: `bg-arena-primary`, `text-arena-primary`,
  `border-arena-primary/20`
- Status: `arena-success`, `arena-warning`, `arena-danger`, `arena-info`,
  `arena-highlight`

## Static Styling Rule

Use Tailwind classes for all static styling.

Avoid:

```tsx
style={{ color: "#7CFF4F", background: "#151C26", borderRadius: 14 }}
```

Prefer:

```tsx
className="rounded-[14px] border border-arena-border bg-arena-surface text-arena-primary"
```

Inline style is acceptable only for runtime-calculated values:

- Avatar generated color
- Canvas drawing colors
- Progress widths/flex values
- Third-party animation state

## Layout Patterns

### Arena Page

```tsx
<div className="jb-page">
  <div className="jb-page-inner">
    <header className="jb-topbar">
      <div>
        <div className="jb-kicker">Contexto</div>
        <h1 className="jb-title">Título</h1>
      </div>
    </header>

    <div className="jb-stack">...</div>
  </div>
</div>
```

### Responsive Behavior

- Base = mobile.
- Desktop starts at `md`.
- Desktop Arena has fixed left sidebar.
- Mobile Arena has bottom nav. Do not render/show bottom nav on desktop.
- Avoid viewport-scaled font sizes. Use fixed Tailwind text sizes per breakpoint.

### Card / Row / Button

- Card: `jb-card` or `rounded-[14px] border border-arena-border bg-arena-surface`
- Row: `flex items-center gap-3 px-3.5 py-3`
- Primary action: `jb-action jb-action-primary` or
  `bg-arena-primary text-arena-bg`
- Secondary action: border + transparent/dark surface.

## Components

Shared Arena primitives live in `src/components/arena-v2`.

Good candidates:

- `JbBadge`
- `JbAvatar`
- `JbBottomSheet`
- `JbScreenHeader`
- `JbDesktopSidebar`
- `JbBottomNav`
- `DotGrid`

Do not put route-specific business copy or state machines inside shared
primitives.

## Accessibility

- Icon-only buttons need `aria-label`.
- Use semantic buttons/links, not clickable `div`.
- Maintain focus visibility.
- Text contrast should work on dark surfaces.
- Form labels must use `htmlFor`.

## Visual QA Checklist

- Mobile layout works at 375px width.
- Desktop layout works with sidebar and no mobile bottom nav.
- Text does not overflow buttons/cards.
- Repeated rows are stable height and scannable.
- No nested decorative cards.
- Static colors come from Arena tokens.
- Background effect never blocks clicks.
