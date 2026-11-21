import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#0a0b10", 900: "#0f1117", 800: "#161923", 700: "#1f2330", 600: "#2a2f40" },
        accent: { DEFAULT: "#7c8cff", soft: "#a5b0ff", deep: "#4f5fe0" },
      },
      fontFamily: { sans: ["Inter", "system-ui", "sans-serif"], mono: ["JetBrains Mono", "ui-monospace", "monospace"] },
    },
  },
  plugins: [],
} satisfies Config;
