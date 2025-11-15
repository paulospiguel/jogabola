# Mapeamento de Cores - Design System

Este documento mapeia as cores fixas para tokens do design system.

## Substituições Comuns

### Cores de Background
- `bg-[#050312]` → `bg-background-base`
- `bg-[#080a25]` → `bg-background-surface`
- `bg-[#0f163f]` → `bg-background-gradient-end`
- `bg-white/5` → `bg-overlay-light`
- `bg-white/10` → `bg-overlay-medium`
- `bg-white/15` → `bg-overlay-heavy`
- `dark:bg-[#080a25]` → `bg-background-surface`

### Cores de Texto
- `text-white` → `text-text-primary`
- `text-white/70` → `text-text-secondary`
- `text-white/60` → `text-text-muted`
- `text-white/50` → `text-text-muted`
- `dark:text-white` → `text-text-primary`
- `text-slate-900` → `text-text-primary`
- `text-slate-600` → `text-text-secondary`
- `text-slate-500` → `text-text-muted`
- `text-slate-300` → `text-text-secondary`

### Cores de Borda
- `border-white/10` → `border-border-default`
- `border-white/15` → `border-border-hover`
- `border-white/8` → `border-border-default`
- `dark:border-white/10` → `border-border-default`

### Cores Neon
- `#6fffe9` → `neon-primary`
- `#24ffe6` → `neon-secondary`
- `#02a7ff` → `accent-blue`
- `#00cfb1` → `brand-green`
- `text-[#6fffe9]` → `text-neon-primary`
- `bg-[#24ffe6]` → `bg-neon-secondary`
- `border-[#6fffe9]` → `border-neon-primary`

### Gradientes
- `from-[#050312] via-[#080a25] to-[#0f163f]` → `from-background-gradient-start via-background-gradient-mid to-background-gradient-end`
- `from-[#24ffe6] to-[#02a7ff]` → `from-neon-secondary to-accent-blue`

### Sombras
- `rgba(36,255,230,0.8)` → `var(--color-shadow-neon-primary)`
- `rgba(36,255,230,0.6)` → `var(--color-shadow-neon-secondary)`
- `rgba(36,255,230,0.3)` → `var(--color-shadow-neon-soft)`

