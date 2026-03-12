---
name: jogabola-design-system
description: >
  Apply the JogaBola Design System when building any UI component, page, screen, or visual element for the JogaBola platform.
  Use this skill whenever the user asks to create, update, or review UI code, components, pages, dashboards, screens, or design tokens for JogaBola Arena or JogaBola DS.
  Also trigger when the user mentions: "design system", "component", "tela", "página", "UI", "botão", "card", "neon", "tema gamer", "cores JogaBola", "layout".
  This skill ensures all implementations match the JogaBola visual identity, brand colors, typography, spacing, and component patterns consistently across the product.
---

# JogaBola Design System Skill

Implement UI components and pages following the JogaBola Design System (JogaBola DS v2.4.0) precisely. This system has **two visual themes** — always determine which applies before writing code.

---

## Step 1 — Identify the Correct Theme

| Context | Theme to Use |
|---|---|
| Landing page, marketing, institutional, onboarding público | **Marketing Theme** (purple/neon green) |
| App autenticado: dashboard, PlayZone, gestão, perfil | **Arena/Gamer Theme** (dark/mint neon) |

When in doubt, use the **Arena/Gamer Theme** (it's the default for authenticated areas).

---

## Step 2 — Apply the Theme Tokens

### 🟣 Marketing Theme (Landing / Institucional)

**Colors:**
```
Background Base:       #21005a
Background Gradient:   from-[#2b0071] to-[#21005a]  (top to bottom)
Neon Accent Primary:   #00cfb1   (titles, buttons, highlights)
Text Primary:          #ffffff
Text Secondary:        #ba93ff   (subtitles, tags)
Text Hover/Active:     #1effbf
Blue Neon (strokes):   #00f0ff
```

**Tailwind classes (Marketing):**
```
bg-[#21005a]
bg-gradient-to-b from-[#2b0071] to-[#21005a]
text-[#00cfb1]   border-[#00cfb1]   bg-[#00cfb1]
text-[#ba93ff]
hover:text-[#1effbf]
stroke-[#00f0ff]  border-[#00f0ff]
shadow-lg shadow-[#00cfb1]/25
border-white/20
backdrop-blur-sm
```

---

### 🎮 Arena / Gamer Theme (App Autenticado — Padrão)

**Colors:**
```
Background Base:       #050312
Background Gradient:   135deg → #050312 → #080a25 → #0f163f
Radial Glow Overlay:   rgba(0,255,213,0.22) at top center
Neon Primary (mint):   #6fffe9   (labels, highlights, meta)
Neon Secondary (CTA):  #24ffe6   (primary action buttons)
Accent Blue:           #02a7ff   (gradient tail)
Brand Colors (DS):     Primary Blue #0d59f2 / Neon Accents #ccff00
```

**Tailwind classes (Arena):**
```
bg-[#050312]
bg-[linear-gradient(135deg,#050312_0%,#080a25_45%,#0f163f_100%)]
bg-[radial-gradient(90%_90%_at_50%_0%,rgba(0,255,213,0.22)_0%,rgba(5,3,18,0)_72%)]
text-[#6fffe9]   border-[#6fffe9]
bg-[#24ffe6]     hover:bg-[#24ffe6]/90
from-[#24ffe6]   to-[#02a7ff]
bg-white/5       bg-white/10
border-white/8   border-white/12
backdrop-blur    backdrop-blur-xl
```

---

## Step 3 — Typography

Read `/references/typography.md` for full font specs.

**Quick reference:**
```
Display / Headings:   Space Grotesk (bold, 700)  — Arena DS default
Marketing Heading:    Bebas Neue → font-heading
Body:                 Inter → font-body
Special/Title:        Concert One → font-display

Heading Scale:
  H1: 700 / 36px    H2: 600 / 30px    H3: 500 / 24px
Body Scale:
  Large 16px / Regular    Medium 14px / Regular    Small 12px / Regular

Responsive Title (Marketing):  text-4xl md:text-5xl lg:text-6xl xl:text-7xl
```

---

## Step 4 — Layout & Spacing

```
Container (Marketing):  max-w-[1440px]  px-5 md:px-14
Container (Arena):      container mx-auto px-4 md:px-8 lg:px-12

Border Radius:
  Cards principais:    rounded-3xl
  Itens / tiles:       rounded-2xl
  Badges / tags:       rounded-full

Spacing gaps:    gap-6  to  gap-8
Grid pattern:    grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]
```

---

## Step 5 — Component Patterns

Read `/references/components.md` for detailed component code.

### Button — CTA Primário (Arena)
```tsx
<button className="group min-w-[180px] bg-[#24ffe6] font-semibold text-slate-900 
  shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 
  hover:-translate-y-1 hover:bg-[#24ffe6]/90 rounded-2xl px-6 py-3">
  Ação Principal
</button>
```

### Button — CTA Secundário / Glass (Arena)
```tsx
<button className="border border-white/25 bg-white/10 text-white backdrop-blur 
  hover:border-[#24ffe6]/60 hover:bg-[#24ffe6]/15 rounded-2xl px-6 py-3 
  transition-all duration-300">
  Ação Secundária
</button>
```

### Card — Frosted Glass (Arena)
```tsx
<div className="rounded-3xl border border-white/8 bg-white/5 backdrop-blur 
  shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)] p-6">
  {/* Card neon destaque: adicionar border-[#24ffe6]/25 */}
</div>
```

### Badge / Meta Label (Arena)
```tsx
<span className="text-xs uppercase tracking-[0.3em] text-[#6fffe9]">
  Label
</span>

<span className="rounded-full border border-white/10 bg-white/15 px-3 py-1 
  text-xs font-medium uppercase tracking-wide text-white/80">
  Tag
</span>
```

### Form Inputs (DS)
```tsx
{/* Default Input */}
<input className="w-full rounded-2xl border border-white/12 bg-white/5 
  px-4 py-3 text-white placeholder-white/40 backdrop-blur 
  focus-visible:ring-[3px] focus-visible:ring-[#6fffe9]/40 
  focus:border-[#24ffe6]/60 outline-none transition-all" 
  placeholder="Enter name" />

{/* Error State */}
<input className="border-rose-500/60 bg-rose-500/5 ..." />
<p className="text-xs text-rose-400 mt-1">Invalid email address</p>
```

### Player / Athlete Card (Arena DS)
```tsx
<div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur p-4">
  {/* Performance Score Card */}
  <div className="text-[#6fffe9] text-xs uppercase tracking-widest">Performance Score</div>
  <div className="text-white text-4xl font-bold font-heading">94.2</div>
  <div className="text-emerald-400 text-sm">+12.5%</div>
</div>
```

---

## Step 6 — Elevation & Effects

```css
/* Card shadow neon suave */
shadow-[0_35px_80px_-45px_rgba(36,255,230,0.8)]

/* CTA shadow */
shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]

/* Avatar glow ring */
/* overlay atrás do avatar: */
<div class="absolute inset-0 bg-[#6fffe9]/30 blur-xl rounded-full -z-10" />

/* Hover transitions */
transition-all duration-300
hover:-translate-y-1
hover:scale-[1.02]
```

---

## Step 7 — Semantic Colors (Alerts / Status)

```
Success:  emerald-500  (#10b981)
Warning:  amber-500   (#f59e0b)
Error:    rose-500    (#f43f5e)
```

---

## Step 8 — Iconography

JogaBola DS inclui ícones temáticos: `soccer`, `timer`, `monitoring`, `leader`, `fitness`, `stadium`, `strategy`, `target`, `schedule`, `team`.

Usar `lucide-react` como biblioteca base de ícones. Ícones customizados do tema ficam em `/assets/icons/`.

---

## Step 9 — Acessibilidade

```
Contraste mínimo AA: text-white e text-slate-200/300 sobre superfícies translúcidas
Focus ring visível: focus-visible:ring-[3px] focus-visible:ring-[#6fffe9]/40
Aria labels em todos os botões icônicos
```

---

## Step 10 — Auth / Sign In Pattern

A tela de login suporta múltiplos métodos (conforme screenshot):
- Social Login (Google)
- Abstract Global Wallet (Web3 — Recommended)
- Wallet Brave, Trust Wallet, MetaMask, Rabby

Implementar como modal split-screen:
- Esquerda: lista de métodos de login com ícones
- Direita: formulário principal (Google OAuth + email field)

```tsx
// Estrutura do modal de login
<div className="grid grid-cols-[280px_1fr] rounded-3xl border border-white/8 
  bg-[#0a0a1a] overflow-hidden min-h-[400px]">
  {/* Coluna esquerda - métodos */}
  <div className="border-r border-white/8 p-6 space-y-2">
    <LoginMethod icon={<Google />} label="Social Login" />
    <LoginMethod icon={<AbstractWallet />} label="Abstract Global Wallet" badge="Recommended" />
    {/* ... */}
  </div>
  {/* Coluna direita - formulário ativo */}
  <div className="p-8 flex flex-col gap-4">
    <GoogleButton />
    <Divider label="or" />
    <EmailInput />
  </div>
</div>
```

---

## Validation Checklist

Antes de finalizar qualquer implementação, verificar:

- [ ] Tema correto identificado (Marketing vs Arena)
- [ ] Cores exclusivamente dos tokens definidos acima
- [ ] Tipografia correta (Space Grotesk / Inter para Arena; Bebas Neue para Marketing)
- [ ] `rounded-3xl` em cards principais, `rounded-2xl` em itens
- [ ] Efeitos `backdrop-blur` em superfícies frosted
- [ ] Shadows neon nos CTAs e cards destacados
- [ ] `transition-all duration-300` em todos os elementos interativos
- [ ] Focus ring visível com `focus-visible:ring-[#6fffe9]/40`
- [ ] Responsividade mobile-first (`md:`, `lg:` breakpoints)
- [ ] Sem inline styles — somente Tailwind + CSS variables
- [ ] `cn()` para classes condicionais

---

## Referências Rápidas

- Cores detalhadas + variáveis CSS: `/references/tokens.md`
- Tipografia e fontes: `/references/typography.md`
