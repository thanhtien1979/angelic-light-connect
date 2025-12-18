import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Divine Rose Aura colors
        rose: {
          DEFAULT: "hsl(var(--rose))",
          light: "hsl(var(--rose-light))",
          glow: "hsl(var(--rose-glow))",
          soft: "hsl(var(--rose-soft))",
        },
        // Legacy gold mapped to rose for compatibility
        gold: {
          DEFAULT: "hsl(var(--gold))",
          light: "hsl(var(--gold-light))",
          glow: "hsl(var(--gold-glow))",
        },
        sky: {
          DEFAULT: "hsl(var(--sky))",
          light: "hsl(var(--sky-light))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "coin-shimmer": {
          "0%": { 
            backgroundPosition: "-200% center",
            filter: "brightness(1)",
          },
          "50%": { 
            filter: "brightness(1.3)",
          },
          "100%": { 
            backgroundPosition: "200% center",
            filter: "brightness(1)",
          },
        },
        "coin-hover-pulse": {
          "0%, 100%": { 
            boxShadow: "0 0 8px hsla(45, 100%, 70%, 0.3), 0 0 16px hsla(45, 100%, 75%, 0.15)",
            filter: "brightness(1)",
          },
          "50%": { 
            boxShadow: "0 0 20px hsla(45, 100%, 70%, 0.5), 0 0 35px hsla(45, 100%, 75%, 0.25)",
            filter: "brightness(1.1)",
          },
        },
        "coin-float": {
          "0%, 100%": { 
            transform: "translateY(0px)",
          },
          "50%": { 
            transform: "translateY(-3px)",
          },
        },
        "light-mote": {
          "0%": { 
            opacity: "0",
            transform: "scale(0)",
          },
          "30%": { 
            opacity: "0.4",
            transform: "scale(1)",
          },
          "100%": { 
            opacity: "0",
            transform: "scale(0.5)",
          },
        },
        "sacred-glow-ring": {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0.5",
            boxShadow: "0 0 0 0 hsla(45, 80%, 75%, 0.4)",
          },
          "50%": {
            opacity: "0.3",
          },
          "100%": {
            transform: "scale(2.5)",
            opacity: "0",
            boxShadow: "0 0 20px 8px hsla(45, 80%, 75%, 0)",
          },
        },
        "blessing-text": {
          "0%": {
            opacity: "0",
            transform: "translateY(4px)",
          },
          "20%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "80%": {
            opacity: "1",
            transform: "translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-4px)",
          },
        },
        "ambient-breath": {
          "0%, 100%": {
            opacity: "0.03",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.06",
            transform: "scale(1.02)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.8s ease-out forwards",
        "fade-in-up": "fade-in-up 1s ease-out forwards",
        "scale-in": "scale-in 0.6s ease-out forwards",
        "coin-shimmer": "coin-shimmer 1s ease-in-out",
        "coin-hover-pulse": "coin-hover-pulse 1.8s ease-in-out infinite",
        "coin-float": "coin-float 4s ease-in-out infinite",
        "light-mote-1": "light-mote 4s ease-in-out infinite",
        "light-mote-2": "light-mote 5s ease-in-out 2s infinite",
        "sacred-glow-ring": "sacred-glow-ring 1.2s ease-out forwards",
        "blessing-text": "blessing-text 1.5s ease-in-out forwards",
        "ambient-breath": "ambient-breath 10s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
