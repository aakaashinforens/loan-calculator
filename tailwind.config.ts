import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pulled from inforens.com computed styles
        primary: {
          DEFAULT: "oklch(0.62 0.181 44.04)", // Inforens orange (~#E1622F)
          hover: "oklch(0.56 0.181 44.04)",
        },
        ink: "oklch(0.141 0.005 285.82)", // near-black body text
        muted: "oklch(0.55 0.02 285.82)", // secondary text
        surface: "oklch(0.985 0.002 285.82)", // subtle card/well fill
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-play)", "var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        btn: "6px",
      },
      transitionTimingFunction: {
        inforens: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05)",
      },
      animation: {
        'fade-in': 'fade-in 0.6s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'slide-up-1': 'slide-up 0.5s ease-out 0.1s both',
        'slide-up-2': 'slide-up 0.5s ease-out 0.2s both',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
