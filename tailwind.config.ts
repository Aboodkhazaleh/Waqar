import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand cyan / accent (modern Jordanian luxury)
        accent: {
          DEFAULT: "#3DB4C4",
          light: "#5FC9D9",
          dark: "#2A8B99",
          muted: "#1E6772",
          glow: "#7DD8E5",
        },
        // Keep "gold" token name to avoid renaming everywhere — but now mapped to cyan
        gold: {
          DEFAULT: "#3DB4C4",
          light: "#5FC9D9",
          dark: "#2A8B99",
          muted: "#1E6772",
          glow: "#7DD8E5",
        },
        dark: {
          DEFAULT: "#000000",
          1: "#0A0A0A",
          2: "#121212",
          3: "#1A1A1A",
          4: "#222222",
          5: "#2C2C2C",
        },
        cream: {
          DEFAULT: "#F5F5F5",
          light: "#FFFFFF",
          dark: "#E5E5E5",
        },
        sand: "#9BB4BC",
      },
      fontFamily: {
        arabic: ["Cairo", "Noto Naskh Arabic", "serif"],
        display: ["Amiri", "serif"],
      },
      backgroundImage: {
        // Replaced gold gradient with clean cyan/white gradients
        "gold-gradient": "linear-gradient(135deg, #3DB4C4 0%, #5FC9D9 50%, #3DB4C4 100%)",
        "accent-gradient": "linear-gradient(135deg, #3DB4C4 0%, #5FC9D9 50%, #3DB4C4 100%)",
        "white-gradient": "linear-gradient(135deg, #FFFFFF 0%, #E5E5E5 100%)",
        "dark-gradient": "linear-gradient(180deg, #000000 0%, #0A0A0A 100%)",
        "hero-gradient": "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 60%, #000000 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease forwards",
        "slide-up": "slideUp 0.7s ease forwards",
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },
    },
  },
  plugins: [],
};

export default config;
