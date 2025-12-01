import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          green: "#00ff88",
          cyan: "#00f0ff",
          pink: "#ff00aa",
          purple: "#aa00ff",
          yellow: "#ffff00",
          orange: "#ff8800",
          red: "#ff0044",
        },
        win: "#00ff88",
        lose: "#ff0044",
        rank: {
          gold: "#ffd700",
          silver: "#c0c0c0",
          bronze: "#cd7f32",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        game: ["var(--font-orbitron)", "system-ui", "sans-serif"],
        pixel: ["'Press Start 2P'", "monospace"],
        numbers: ["var(--font-rajdhani)", "system-ui", "sans-serif"],
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "shake": "shake 0.5s ease-in-out",
        "coin-flip": "coin-flip 1s ease-in-out",
        "gradient-shift": "gradient-shift 3s ease infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-5px)" },
          "75%": { transform: "translateX(5px)" },
        },
        "coin-flip": {
          "0%": { transform: "rotateY(0)" },
          "100%": { transform: "rotateY(360deg)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-game": "linear-gradient(135deg, #00ff88, #00f0ff, #ff00aa)",
      },
      boxShadow: {
        "neon-green": "0 0 20px rgba(0, 255, 136, 0.5)",
        "neon-cyan": "0 0 20px rgba(0, 240, 255, 0.5)",
        "neon-pink": "0 0 20px rgba(255, 0, 170, 0.5)",
        "neon-gold": "0 0 20px rgba(255, 215, 0, 0.5)",
      },
    },
  },
  plugins: [],
} satisfies Config;
