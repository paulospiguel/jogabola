import type { Config } from "tailwindcss";
import * as colors from "tailwindcss/colors";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  safelist: ["dark", "light"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        error: colors.red[500],
        success: colors.green[500],
        foreground: "hsl(var(--foreground))",
        brand: {
          player: {
            DEFAULT: "var(--player-primary)",
            hover: "var(--player-primary-hover)",
          },
          manager: {
            DEFAULT: "var(--manager-primary)",
            hover: "var(--manager-primary-hover)",
          },
          secondary: {
            DEFAULT: "var(--brand-secondary)",
            hover: "var(--brand-secondary-hover)",
          },
        },
        backgroundPrimary: {
          DEFAULT: "hsl(var(--background-primary))",
          foreground: "hsl(var(--background-primary-foreground))",
          dark: "hsl(var(--background-primary-dark))",
        },
        background: {
          DEFAULT: "hsl(var(--background))",
          foreground: "hsl(var(--background-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          blue: "var(--primary-blue)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["monospace"],
        heading: ["var(--font-concert-one)", "sans-serif"],
        // heading: ['var(--font-heading)', ...fontFamily.sans],
        body: ['var(--font-body)', ...fontFamily.sans]
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "bg-position": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "infinite-scroll": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        "marquee-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(calc(-100% - var(--gap)))" },
        },
        "marquee-y": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(calc(-100% - var(--gap)))" },
        },
        "flip-words": {
          "10%": { transform: "translateY(-112%)" },
          "25%": { transform: "translateY(-100%)" },
          "35%": { transform: "translateY(-212%)" },
          "50%": { transform: "translateY(-200%)" },
          "60%": { transform: "translateY(-312%)" },
          "75%": { transform: "translateY(-300%)" },
          "85%": { transform: "translateY(-412%)" },
          "100%": { transform: "translateY(-400%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "infinite-scroll": "infinite-scroll 25s linear infinite",
        "marquee-horizontal": "marquee-x var(--duration) infinite linear",
        "marquee-vertical": "marquee-y var(--duration) linear infinite",
        "flip-words": "flip-words 8s infinite",
      }
    },
    cursor: {
      hand: "url('/cursor.png'), default",
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;