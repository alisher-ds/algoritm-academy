import type { Config } from "tailwindcss";

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
        brand: {
          DEFAULT: "#00c853",
          light: "#5efc82",
          dark: "#009624",
          subtle: "rgba(0, 200, 83, 0.1)",
        },
        navy: {
          DEFAULT: "#0b1329",
          card: "#111c3a",
          border: "#1e294b",
          subtle: "#162347",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
