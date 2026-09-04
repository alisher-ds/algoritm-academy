import type { Config } from "tailwindcss";

/**
 * Algoritm — yagona dizayn tizimi
 * Brend yashili (500 = #00C853) barcha sahifalarda bitta token orqali ishlatiladi.
 * Shriftlar next/font orqali yuklanadi (layout.tsx): Inter (body) + Manrope (sarlavhalar).
 */
const brand = {
  50: "#ecfdf3",
  100: "#d1fae0",
  200: "#a7f3c9",
  300: "#5efc82",
  400: "#00e676",
  500: "#00c853",
  600: "#00a844",
  700: "#018338",
  800: "#036129",
  900: "#045024",
  950: "#002d14",
};

const navy = {
  50: "#f0f4ff",
  100: "#dbe2f3",
  200: "#b9c4e2",
  300: "#8b9ccb",
  400: "#5c70ad",
  500: "#3b4e8c",
  600: "#2b3a6e",
  700: "#1e2a52",
  800: "#141e3f",
  900: "#0c142e",
  950: "#070b14",
};

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand,
        navy,
        "night": {
          DEFAULT: "#0b1329",
          card: "#111c3a",
          border: "#1e294b",
          subtle: "#162347",
          deep: "#070b14",
        },
      },
      fontFamily: {
        sans: ['"Inter Variable"', "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ['"Manrope Variable"', '"Inter Variable"', "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,23,42,.05), 0 8px 24px -8px rgba(15,23,42,.12)",
        card: "0 1px 2px rgba(15,23,42,.04), 0 12px 32px -12px rgba(15,23,42,.18)",
        lift: "0 2px 6px rgba(15,23,42,.06), 0 24px 48px -16px rgba(2,45,20,.25)",
        glow: "0 0 0 1px rgba(0,200,83,.12), 0 12px 40px -8px rgba(0,200,83,.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up .6s ease-out both",
        "fade-in": "fade-in .5s ease-out both",
        "ken-burns": "ken-burns 14s ease-out both",
        shimmer: "shimmer 2.2s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
