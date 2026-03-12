# JogaBola Design Tokens Reference

## CSS Variables (globals.css)

Declare no `:root` ou tema escuro:

```css
:root {
  /* === ARENA THEME === */
  --bg-base: #050312;
  --bg-gradient-start: #050312;
  --bg-gradient-mid: #080a25;
  --bg-gradient-end: #0f163f;

  --neon-primary: #6fffe9;       /* highlights, labels, meta */
  --neon-cta: #24ffe6;           /* primary CTAs */
  --neon-accent-blue: #02a7ff;   /* gradient tail */
  --neon-glow: rgba(36, 255, 230, 0.8);

  /* === MARKETING THEME === */
  --bg-marketing: #21005a;
  --bg-marketing-grad-from: #2b0071;
  --neon-green: #00cfb1;
  --neon-green-active: #1effbf;
  --purple-secondary: #ba93ff;
  --blue-neon: #00f0ff;

  /* === BRAND (DS oficial) === */
  --brand-primary-blue: #0d59f2;
  --brand-neon-accents: #ccff00;
  --neutral-deep-charcoal: #101622;
  --neutral-slate-gray: #475569;
  --neutral-soft-pearl: #f5f6f8;

  /* === SEMANTIC === */
  --color-success: #10b981;   /* emerald-500 */
  --color-warning: #f59e0b;   /* amber-500 */
  --color-error: #f43f5e;     /* rose-500 */

  /* === SURFACES === */
  --surface-1: rgba(255,255,255,0.05);
  --surface-2: rgba(255,255,255,0.10);
  --border-subtle: rgba(255,255,255,0.08);
  --border-medium: rgba(255,255,255,0.12);
  --border-strong: rgba(255,255,255,0.20);
}
```

## Tailwind Custom Config (tailwind.config.ts)

```ts
extend: {
  colors: {
    brand: {
      'neon-mint': '#6fffe9',
      'cta': '#24ffe6',
      'blue': '#02a7ff',
      'primary-blue': '#0d59f2',
      'neon-accents': '#ccff00',
      'green': '#00cfb1',
      'purple': '#ba93ff',
      'bg': '#21005a',
      'bg-dark': '#050312',
    },
  },
  backgroundImage: {
    'arena-gradient': 'linear-gradient(135deg, #050312 0%, #080a25 45%, #0f163f 100%)',
    'arena-glow': 'radial-gradient(90% 90% at 50% 0%, rgba(0,255,213,0.22) 0%, rgba(5,3,18,0) 72%)',
    'marketing-gradient': 'linear-gradient(to bottom, #2b0071, #21005a)',
  },
  boxShadow: {
    'neon-card': '0 35px 80px -45px rgba(36,255,230,0.8)',
    'neon-cta': '0 16px 45px -20px rgba(36,255,230,0.9)',
    'neon-green': '0 0 20px rgba(0,207,177,0.25)',
  },
  fontFamily: {
    heading: ['Bebas Neue', 'sans-serif'],       // Marketing
    body: ['Inter', 'sans-serif'],               // Corpo geral
    display: ['Concert One', 'cursive'],         // Especial
    // Arena DS usa Space Grotesk nativamente via Tailwind
  },
}
```

## Opacity Scale para Superfícies

| Uso | Classe |
|-----|--------|
| Card background | `bg-white/5` |
| Card background destacado | `bg-white/10` |
| Border sutil | `border-white/8` |
| Border médio | `border-white/12` |
| Border forte | `border-white/20` |
| Border/25 | `border-white/25` |
| Overlay leve | `bg-white/15` |

## Gradient Neon CTA

```tsx
// Botão com gradiente mint → blue
<button className="bg-gradient-to-r from-[#24ffe6] to-[#02a7ff]">
```

## Glow Ring para Avatar/Player

```tsx
<div className="relative w-20 h-20">
  {/* Glow layer */}
  <div className="absolute inset-0 bg-[#6fffe9]/30 blur-xl rounded-full" />
  {/* Avatar */}
  <img className="relative rounded-full w-20 h-20 object-cover border-2 border-[#6fffe9]/40" src={avatar} />
</div>
```
