import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#8B6F47",
        signal: "#D9A88E",
        ember: "#E8956F",
        warm: {
          50: "#FFFBF7",
          100: "#FFF8F0",
          200: "#FFEEE4",
          300: "#FFE0D1",
          400: "#FFD9C7",
          500: "#F5A962",
          600: "#E89A3B",
          700: "#C2410C",
          800: "#9E3500",
          900: "#7A2A00",
        },
      },
    },
  },
  plugins: [],
};

export default config;
