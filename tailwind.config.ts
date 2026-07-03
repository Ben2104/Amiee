import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "amie-cream": "#FFF7EC",
        "amie-gold": "#D2AE60",
        "amie-green": "#3A5828",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        script: ["var(--font-dancing-script)", "cursive"],
        note: ["var(--font-nunito)", "sans-serif"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 12px rgba(232,106,146,0.35))", transform: "scale(1)" },
          "50%": { filter: "drop-shadow(0 0 32px rgba(232,106,146,0.72))", transform: "scale(1.05)" },
        },
        "float-a": {
          "0%, 100%": { transform: "translateY(0) rotate(-5deg)" },
          "50%": { transform: "translateY(-12px) rotate(5deg)" },
        },
        "float-b": {
          "0%, 100%": { transform: "translateY(-5px) rotate(3deg)" },
          "50%": { transform: "translateY(7px) rotate(-4deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.1", transform: "scale(0.5)" },
        },
        "float-up": {
          "0%": { transform: "translateY(0) rotate(-12deg)", opacity: "0.9" },
          "65%": { opacity: "0.4" },
          "100%": { transform: "translateY(-110vh) rotate(16deg)", opacity: "0" },
        },
        "bounce-btn": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-4px) scale(1.02)" },
        },
        "dance-tonton": {
          "0%, 100%": { transform: "translateY(0) rotate(-7deg) scale(1)" },
          "25%": { transform: "translateY(-18px) rotate(9deg) scale(1.08)" },
          "50%": { transform: "translateY(-2px) rotate(-5deg) scale(0.95)" },
          "75%": { transform: "translateY(-14px) rotate(11deg) scale(1.05)" },
        },
        "scroll-bounce": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.6" },
          "50%": { transform: "translateY(6px)", opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        "float-a": "float-a 3s ease-in-out infinite",
        "float-b": "float-b 3.6s ease-in-out infinite",
        twinkle: "twinkle 2.3s ease-in-out infinite",
        "float-up": "float-up 2.8s ease-out infinite",
        "bounce-btn": "bounce-btn 2.2s ease-in-out infinite",
        "dance-tonton": "dance-tonton 1.1s ease-in-out infinite",
        "scroll-bounce": "scroll-bounce 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
