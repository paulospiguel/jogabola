import baseConfig from "@repo/ui/tailwind.config";

export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      colors: {
        player: "var(--player-primary)",
        manager: "var(--manager-primary)",
        secondary: "var(--brand-secondary)",
        primary: {
          DEFAULT: "var(--color-primary)",
          dark: "var(--color-primary-dark)",
        },
        background: {
          DEFAULT: "var(--background)",
          foreground: "var(--background-foreground)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["monospace"],
        heading: ["var(--font-concert-one)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        // heading: ['var(--font-heading)'],
      },
    },
  },
  plugins: [],
};
