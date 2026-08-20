import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          navy: "#0f172a",
          blue: "#2563eb",
          purple: "#7c3aed",
          cyan: "#06b6d4",
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0,0,0,0.3)",
        "glass-light": "0 8px 32px 0 rgba(31,38,135,0.07)",
        "glow-blue": "0 0 20px rgba(37,99,235,0.4)",
        "glow-gold": "0 0 20px rgba(234,179,8,0.5)",
        "glow-silver": "0 0 20px rgba(148,163,184,0.5)",
        "glow-bronze": "0 0 20px rgba(217,119,6,0.4)",
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "64px",
      },
      animation: {
        "float-slow": "float-slow 20s ease-in-out infinite",
        "float-slower": "float-slower 25s ease-in-out infinite",
        "float-slowest": "float-slowest 30s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "aurora-1": "aurora-drift-1 18s ease-in-out infinite",
        "aurora-2": "aurora-drift-2 22s ease-in-out infinite",
        "aurora-3": "aurora-drift-3 26s ease-in-out infinite",
        "aurora-4": "aurora-drift-4 20s ease-in-out infinite",
      },
      keyframes: {
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
        "float-slower": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(-40px, 30px) scale(1.08)" },
          "66%": { transform: "translate(25px, -40px) scale(0.92)" },
        },
        "float-slowest": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(20px, -30px) scale(1.1)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "aurora-drift-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.6" },
          "25%": { transform: "translate(8vw, 5vh) scale(1.15)", opacity: "0.8" },
          "50%": { transform: "translate(3vw, 12vh) scale(1.05)", opacity: "0.5" },
          "75%": { transform: "translate(-5vw, 3vh) scale(1.1)", opacity: "0.7" },
        },
        "aurora-drift-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.5" },
          "30%": { transform: "translate(-6vw, 8vh) scale(1.1)", opacity: "0.7" },
          "60%": { transform: "translate(4vw, -5vh) scale(0.95)", opacity: "0.6" },
        },
        "aurora-drift-3": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.5" },
          "40%": { transform: "translate(10vw, -6vh) scale(1.12)", opacity: "0.75" },
          "70%": { transform: "translate(-3vw, 8vh) scale(0.9)", opacity: "0.55" },
        },
        "aurora-drift-4": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.4" },
          "50%": { transform: "translate(-7vw, 6vh) scale(1.08)", opacity: "0.65" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
