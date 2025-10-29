/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px" },
    },
    extend: {
      colors: {
        glds: {
          primary: "#D4AF37",
          primaryDark: "#A8871A",
          bg: "#0B0B0C",
          paper: "#101114",
          accent: "#F5E7C6",
        },
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        glow: "0 0 25px rgba(212,175,55,0.35)",
      },
      keyframes: {
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        blob: {
          "0%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(20px,-30px) scale(1.05)" },
          "66%": { transform: "translate(-25px,20px) scale(0.95)" },
          "100%": { transform: "translate(0,0) scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        blob: "blob 18s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};