# UI/UX - Estilo Baseado no TopGoal

## 🎨 Paleta de Cores

| Nome                  | Hex        | Uso                          |
|-----------------------|------------|-------------------------------|
| Fundo principal       | `#21005a`  | Background do site e seções  |
| Fundo em gradiente    | `#2b0071` → `#21005a` | Hero e áreas destacadas  |
| Destaque neon         | `#00cfb1`  | Títulos, botões e highlights |
| Texto principal       | `#ffffff`  | Títulos e corpo              |
| Texto secundário      | `#ba93ff`  | Subtítulos, tags             |
| Texto ativo (hover)   | `#1effbf`  | Hover em links e botões      |

---

## 🖋 Tipografia

- **Fonte principal:** `Raleway Variable`  
- **Fonte alternativa:** `Urbanist Variable` (usada em alguns cards e estatísticas)
- **Estilo:** Sans-serif, moderna e limpa
- **Peso dos títulos:** `700–900`  
- **Tamanho padrão dos títulos:** `3rem` (desktop), ajustável em mobile  
- **Tamanho do corpo:** `1.125rem` a `1.25rem`

---

## 🔳 Componentes de UI

### Hero Section
- Fundo gradiente roxo escuro
- Título em 3 linhas:
  - `AI-POWERED` em branco
  - `SPORTS AUTONOMOUS WORLD` com partes em neon
  - `FOR EVERYONE` centralizado

### Cards
- Cantos arredondados (`8px`+)
- Fundo com blend de roxo e sobreposição translúcida
- Imagens ou avatares com **gradiente overlay**
- Ícones e texto centralizados
- Destaques com borda e sombra neon

### Hexágono (ao redor da bola)
- SVG com stroke neon azul (`#00f0ff`)
- Padding interno generoso
- Estilo 3D para dar profundidade

---

## ✨ Efeitos Visuais

| Efeito             | Descrição                                 |
|--------------------|-------------------------------------------|
| Hover em links     | Cor muda para `#1effbf` + sublinhado      |
| Transições         | `.3s ease-in-out` para hover e botões     |
| Cartões flutuantes | Sombras leves e efeito de profundidade    |
| Gradiente de fundo | `linear-gradient(180deg, #2b0071 0%, #21005a 100%)` |

---

## 📐 Layout

- **Largura máxima:** `1440px`
- **Padding:** `5vw` ou `3.5rem`
- **Grid:** `flex` com `gap` generoso (`3rem+`)
- **Alinhamento:** Centralizado (títulos, gráficos, botões)

---

## 🧩 Exemplo de Seção Hero (Figma)

```plaintext
Frame: 1440 x 900
- Background: Linear gradient (roxo escuro)
- Title: Raleway, 72px, bold, branco + destaque neon
- Subtítulo: Raleway, 24px, roxo claro
- Bola 3D: SVG ou PNG flutuando à direita
- Hexágono: SVG com stroke neon