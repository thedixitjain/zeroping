import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "'Fira Code'", "Consolas", "monospace"],
        sans: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        gray: {
          950: "#0a0a0f",
          900: "#111118",
          850: "#16161f",
          800: "#1c1c28",
          750: "#22222f",
          700: "#2a2a3a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
