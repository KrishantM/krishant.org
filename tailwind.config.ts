import type { Config } from "tailwindcss";

/**
 * Colours are CSS-variable driven (see globals.css) so a single token set powers
 * both the warm-dark and warm-light themes. Channels are stored as
 * space-separated RGB so Tailwind's `/<alpha-value>` syntax keeps working.
 */
const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/content/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: "rgb(var(--bg) / <alpha-value>)",
          900: "rgb(var(--bg) / <alpha-value>)",
          800: "rgb(var(--bg-2) / <alpha-value>)",
          700: "rgb(var(--bg-2) / <alpha-value>)",
        },
        // Glass / overlay tint — inverts between themes via --surface.
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          faint: "rgb(var(--ink-faint) / <alpha-value>)",
        },
        line: "rgb(var(--line) / 0.14)",
        // Signature warm accents.
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          gold: "rgb(var(--accent-2) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "Cambria", "serif"],
        hand: ["var(--font-hand)", "ui-rounded", "cursive"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        shell: "1200px",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 80px -20px rgb(var(--accent) / 0.5)",
        card: "0 1px 0 0 rgb(var(--surface) / 0.05) inset, 0 30px 60px -30px rgba(0,0,0,0.55)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgb(var(--line) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--line) / 0.07) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(ellipse at center, rgb(var(--accent) / 0.18), transparent 70%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "panel-in": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(0,-18px,0)" },
        },
        pulseslow: {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.75" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.3s ease-out both",
        "panel-in": "panel-in 0.35s cubic-bezier(0.16,1,0.3,1) both",
        pop: "pop 0.6s cubic-bezier(0.16,1,0.3,1) both",
        drift: "drift 9s ease-in-out infinite",
        pulseslow: "pulseslow 6s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
