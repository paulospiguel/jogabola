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
          foreground: "var(--color-primary-foreground)",
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
      animation: {
        trail: "trail var(--duration) linear infinite",
      },
      keyframes: {
        trail: {
          "0%": { "--angle": "0deg" },
          "100%": { "--angle": "360deg" },
        },
      },
    },
  },
  plugins: [],
};
