# JogaBola Typography Reference

## Fontes por Contexto

| Contexto | Fonte | Tailwind Class | Peso |
|---|---|---|---|
| Títulos (Arena DS) | Space Grotesk | `font-[Space_Grotesk]` ou configurado como padrão | 700 |
| Títulos (Marketing) | Bebas Neue | `font-heading` | 400 (já é display) |
| Corpo geral | Inter | `font-body` | 400 / 500 |
| Especial / Feature | Concert One | `font-display` | 400 |
| Números / Stats | Space Grotesk | `font-heading tabular-nums` | 700 |

## Escala de Tamanhos (Arena DS)

```
H1: font-bold text-[36px] leading-[1.1]   (700 / 36px)
H2: font-semibold text-[30px]              (600 / 30px)
H3: font-medium text-[24px]               (500 / 24px)

Body Large:   text-base    (16px / Regular)
Body Medium:  text-sm      (14px / Regular)
Body Small:   text-xs      (12px / Regular)

Label Meta:   text-xs uppercase tracking-[0.3em]
Tag:          text-xs font-medium uppercase tracking-wide
```

## Escala Responsiva (Marketing / Landing)

```
Display/Hero:
  text-4xl md:text-5xl lg:text-6xl xl:text-7xl
  font-heading (Bebas Neue)

Section Title:
  text-3xl md:text-4xl lg:text-5xl

Body Large:
  text-base lg:text-lg

Caption/Meta:
  text-sm text-[#ba93ff]
```

## Cores de Texto por Hierarquia

### Arena Theme
```tsx
// Primário (títulos, valores)
<h1 className="text-white font-bold">

// Meta / Labels
<span className="text-[#6fffe9] text-xs uppercase tracking-[0.3em]">

// Corpo secundário
<p className="text-white/70">

// Desabilitado / placeholder
<p className="text-white/40">

// Sucesso
<span className="text-emerald-400">+12.5%</span>

// Erro
<span className="text-rose-400">Invalid</span>
```

### Marketing Theme
```tsx
// Primário
<h1 className="text-white font-heading">

// Neon accent (destaque)
<span className="text-[#00cfb1]">

// Secundário / subtítulo
<p className="text-[#ba93ff]">

// Hover ativo
<a className="hover:text-[#1effbf]">
```

## Exemplo — Stats Card (Arena)

```tsx
<div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur p-4">
  <p className="text-[#6fffe9] text-xs uppercase tracking-[0.3em] mb-1">
    Performance Score
  </p>
  <div className="flex items-end gap-2">
    <span className="text-white text-4xl font-bold tabular-nums">94.2</span>
    <span className="text-emerald-400 text-sm mb-1">+12.5%</span>
  </div>
</div>
```

## Exemplo — Player Card Label (Arena)

```tsx
<div>
  <p className="text-white font-semibold text-sm">Marco Reus</p>
  <p className="text-white/60 text-xs">Forward • #11</p>
</div>
```

## Import de Fontes (Next.js)

```ts
// src/styles/fonts.ts
import { Bebas_Neue, Inter, Concert_One } from 'next/font/google'

export const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-heading',
})

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export const concertOne = Concert_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})
```

```tsx
// layout.tsx
<body className={`${inter.variable} ${bebasNeue.variable} ${concertOne.variable}`}>
```
