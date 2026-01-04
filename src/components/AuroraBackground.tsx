// Aurora Background with animated wave effects
// Respects light/dark/twilight/ocean/forest modes with smooth transitions
// Includes subtle flowing aurora waves per theme

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// Theme-specific aurora wave configurations
const auroraConfigs = {
  light: {
    wave1: "hsla(280, 50%, 78%, 0.08), hsla(340, 55%, 82%, 0.06), hsla(260, 45%, 80%, 0.07)",
    wave2: "hsla(340, 50%, 80%, 0.06), hsla(280, 45%, 75%, 0.05), hsla(320, 50%, 78%, 0.06)",
    wave3: "hsla(260, 45%, 82%, 0.05), hsla(340, 50%, 78%, 0.04), hsla(280, 50%, 80%, 0.05)",
  },
  dark: {
    wave1: "hsla(280, 55%, 40%, 0.12), hsla(340, 50%, 45%, 0.1), hsla(260, 50%, 38%, 0.11)",
    wave2: "hsla(340, 50%, 42%, 0.1), hsla(280, 55%, 38%, 0.08), hsla(320, 50%, 40%, 0.09)",
    wave3: "hsla(260, 50%, 35%, 0.08), hsla(340, 45%, 40%, 0.07), hsla(280, 55%, 38%, 0.08)",
  },
  twilight: {
    wave1: "hsla(38, 70%, 55%, 0.14), hsla(260, 45%, 38%, 0.12), hsla(32, 65%, 50%, 0.13)",
    wave2: "hsla(260, 45%, 35%, 0.1), hsla(38, 65%, 52%, 0.09), hsla(45, 70%, 55%, 0.1)",
    wave3: "hsla(32, 60%, 48%, 0.08), hsla(260, 40%, 35%, 0.07), hsla(38, 65%, 50%, 0.08)",
  },
  ocean: {
    wave1: "hsla(180, 55%, 45%, 0.14), hsla(195, 50%, 40%, 0.12), hsla(175, 55%, 42%, 0.13)",
    wave2: "hsla(195, 50%, 38%, 0.1), hsla(180, 55%, 42%, 0.09), hsla(210, 45%, 40%, 0.1)",
    wave3: "hsla(175, 55%, 40%, 0.08), hsla(195, 50%, 38%, 0.07), hsla(180, 55%, 42%, 0.08)",
  },
  forest: {
    wave1: "hsla(145, 45%, 42%, 0.14), hsla(135, 40%, 38%, 0.12), hsla(155, 40%, 35%, 0.13)",
    wave2: "hsla(135, 40%, 35%, 0.1), hsla(145, 45%, 40%, 0.09), hsla(140, 45%, 38%, 0.1)",
    wave3: "hsla(155, 40%, 32%, 0.08), hsla(135, 40%, 35%, 0.07), hsla(145, 45%, 38%, 0.08)",
  },
  midnight: {
    wave1: "hsla(215, 30%, 35%, 0.1), hsla(220, 25%, 40%, 0.08), hsla(210, 30%, 38%, 0.09)",
    wave2: "hsla(220, 25%, 32%, 0.07), hsla(215, 30%, 38%, 0.06), hsla(225, 25%, 35%, 0.07)",
    wave3: "hsla(210, 30%, 30%, 0.05), hsla(220, 25%, 35%, 0.04), hsla(215, 30%, 32%, 0.05)",
  },
};

const AuroraBackground = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Determine active theme
  const activeTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";
  const themeKey = (activeTheme && activeTheme in auroraConfigs) 
    ? activeTheme as keyof typeof auroraConfigs 
    : "light";
  
  const config = auroraConfigs[themeKey];

  // Noise SVG for all themes
  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

  // Animation styles - disabled if reduced motion is preferred
  const waveAnimation1 = prefersReducedMotion ? "none" : "aurora-wave-1 25s ease-in-out infinite";
  const waveAnimation2 = prefersReducedMotion ? "none" : "aurora-wave-2 32s ease-in-out infinite";
  const waveAnimation3 = prefersReducedMotion ? "none" : "aurora-wave-3 40s ease-in-out infinite";
  const driftAnimation = prefersReducedMotion ? "none" : "aurora-drift 20s ease-in-out infinite";

  const isLight = themeKey === "light";
  const isMidnight = themeKey === "midnight";

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base gradient layer per theme */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: getBaseGradient(themeKey),
        }}
      />

      {/* Aurora Wave Layer 1 - Slowest, largest */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 15% 20%, ${config.wave1.split(", ")[0]} 0%, transparent 50%),
            radial-gradient(ellipse 100% 70% at 85% 75%, ${config.wave1.split(", ")[1]} 0%, transparent 45%),
            radial-gradient(ellipse 90% 60% at 50% 50%, ${config.wave1.split(", ")[2]} 0%, transparent 55%)
          `,
          backgroundSize: "200% 200%",
          animation: waveAnimation1,
          willChange: prefersReducedMotion ? "auto" : "background-position, opacity",
        }}
      />

      {/* Aurora Wave Layer 2 - Medium speed */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `
            radial-gradient(ellipse 80% 90% at 75% 25%, ${config.wave2.split(", ")[0]} 0%, transparent 50%),
            radial-gradient(ellipse 110% 65% at 25% 70%, ${config.wave2.split(", ")[1]} 0%, transparent 45%),
            radial-gradient(ellipse 70% 80% at 60% 40%, ${config.wave2.split(", ")[2]} 0%, transparent 50%)
          `,
          backgroundSize: "180% 180%",
          animation: waveAnimation2,
          willChange: prefersReducedMotion ? "auto" : "background-position, transform",
        }}
      />

      {/* Aurora Wave Layer 3 - Fastest, subtlest */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `
            radial-gradient(ellipse 100% 50% at 40% 30%, ${config.wave3.split(", ")[0]} 0%, transparent 45%),
            radial-gradient(ellipse 60% 100% at 70% 60%, ${config.wave3.split(", ")[1]} 0%, transparent 50%),
            radial-gradient(ellipse 85% 75% at 30% 80%, ${config.wave3.split(", ")[2]} 0%, transparent 45%)
          `,
          backgroundSize: "220% 220%",
          animation: waveAnimation3,
          willChange: prefersReducedMotion ? "auto" : "background-position, opacity",
        }}
      />

      {/* Floating orbs with drift animation */}
      <div
        className="absolute inset-0 transition-all duration-700"
        style={{
          animation: driftAnimation,
          willChange: prefersReducedMotion ? "auto" : "transform",
        }}
      >
        <div
          className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full transition-all duration-700"
          style={{
            background: getOrbGradient(themeKey, 1),
            filter: "blur(35px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full transition-all duration-700"
          style={{
            background: getOrbGradient(themeKey, 2),
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute top-2/3 left-1/3 w-60 h-60 rounded-full transition-all duration-700"
          style={{
            background: getOrbGradient(themeKey, 3),
            filter: "blur(32px)",
          }}
        />
      </div>

      {/* Starfield overlay - only for Midnight theme */}
      {isMidnight && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 10% 15%, hsla(220, 30%, 85%, 0.6) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 25% 8%, hsla(215, 40%, 90%, 0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 40% 22%, hsla(210, 35%, 80%, 0.55) 0%, transparent 100%),
              radial-gradient(2px 2px at 55% 5%, hsla(220, 35%, 88%, 0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 70% 18%, hsla(215, 30%, 82%, 0.5) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 85% 12%, hsla(220, 40%, 85%, 0.45) 0%, transparent 100%),
              radial-gradient(1px 1px at 15% 35%, hsla(210, 30%, 80%, 0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 30% 42%, hsla(215, 35%, 85%, 0.4) 0%, transparent 100%),
              radial-gradient(2px 2px at 50% 30%, hsla(220, 40%, 90%, 0.35) 0%, transparent 100%),
              radial-gradient(1px 1px at 65% 38%, hsla(215, 30%, 82%, 0.5) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 80% 28%, hsla(210, 35%, 88%, 0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 92% 35%, hsla(220, 30%, 80%, 0.45) 0%, transparent 100%),
              radial-gradient(1px 1px at 8% 55%, hsla(215, 35%, 85%, 0.5) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 22% 62%, hsla(220, 40%, 82%, 0.4) 0%, transparent 100%),
              radial-gradient(1px 1px at 38% 50%, hsla(210, 30%, 88%, 0.45) 0%, transparent 100%),
              radial-gradient(2px 2px at 58% 58%, hsla(215, 35%, 85%, 0.35) 0%, transparent 100%),
              radial-gradient(1px 1px at 75% 52%, hsla(220, 30%, 80%, 0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 88% 60%, hsla(215, 40%, 85%, 0.4) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 12% 78%, hsla(210, 35%, 82%, 0.45) 0%, transparent 100%),
              radial-gradient(1px 1px at 28% 85%, hsla(220, 30%, 88%, 0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 45% 72%, hsla(215, 35%, 80%, 0.4) 0%, transparent 100%),
              radial-gradient(2px 2px at 62% 80%, hsla(210, 40%, 85%, 0.35) 0%, transparent 100%),
              radial-gradient(1px 1px at 78% 75%, hsla(220, 30%, 82%, 0.5) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 90% 82%, hsla(215, 35%, 88%, 0.4) 0%, transparent 100%)
            `,
            opacity: 0.7,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Subtle noise overlay for all themes */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: noiseSvg,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: isLight ? 0.025 : isMidnight ? 0.02 : 0.035,
          mixBlendMode: isLight ? "overlay" : "soft-light",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// Helper function for base gradient per theme
function getBaseGradient(theme: string): string {
  switch (theme) {
    case "dark":
      return `
        radial-gradient(ellipse 90% 60% at 20% 25%, hsla(280, 50%, 35%, 0.18) 0%, transparent 55%),
        radial-gradient(ellipse 70% 50% at 75% 65%, hsla(340, 45%, 40%, 0.14) 0%, transparent 50%),
        radial-gradient(ellipse 80% 70% at 50% 45%, hsla(260, 45%, 30%, 0.12) 0%, transparent 55%)
      `;
    case "twilight":
      return `
        radial-gradient(ellipse 85% 55% at 25% 30%, hsla(38, 65%, 50%, 0.18) 0%, transparent 50%),
        radial-gradient(ellipse 70% 50% at 70% 60%, hsla(260, 40%, 35%, 0.16) 0%, transparent 50%),
        radial-gradient(ellipse 90% 70% at 50% 50%, hsla(32, 55%, 45%, 0.12) 0%, transparent 55%)
      `;
    case "ocean":
      return `
        radial-gradient(ellipse 90% 60% at 20% 30%, hsla(180, 55%, 40%, 0.18) 0%, transparent 55%),
        radial-gradient(ellipse 75% 50% at 75% 60%, hsla(195, 50%, 35%, 0.16) 0%, transparent 50%),
        radial-gradient(ellipse 85% 70% at 50% 45%, hsla(210, 45%, 30%, 0.14) 0%, transparent 55%)
      `;
    case "forest":
      return `
        radial-gradient(ellipse 90% 60% at 25% 30%, hsla(145, 45%, 38%, 0.18) 0%, transparent 55%),
        radial-gradient(ellipse 75% 50% at 70% 65%, hsla(135, 40%, 32%, 0.16) 0%, transparent 50%),
        radial-gradient(ellipse 85% 70% at 50% 45%, hsla(155, 40%, 28%, 0.14) 0%, transparent 55%)
      `;
    case "midnight":
      return `
        radial-gradient(ellipse 90% 70% at 20% 30%, hsla(215, 30%, 18%, 0.3) 0%, transparent 60%),
        radial-gradient(ellipse 80% 50% at 75% 60%, hsla(220, 25%, 22%, 0.25) 0%, transparent 55%),
        radial-gradient(ellipse 85% 65% at 50% 45%, hsla(210, 30%, 15%, 0.2) 0%, transparent 55%)
      `;
    default: // light
      return `
        radial-gradient(ellipse 90% 60% at 20% 25%, hsla(280, 45%, 75%, 0.12) 0%, transparent 55%),
        radial-gradient(ellipse 70% 50% at 75% 65%, hsla(340, 55%, 80%, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse 80% 70% at 50% 45%, hsla(260, 40%, 78%, 0.08) 0%, transparent 55%)
      `;
  }
}

// Helper function for orb gradients per theme
function getOrbGradient(theme: string, orbIndex: number): string {
  const orbConfigs: Record<string, string[]> = {
    light: [
      "radial-gradient(circle, hsla(280, 50%, 82%, 0.14) 0%, transparent 60%)",
      "radial-gradient(circle, hsla(340, 50%, 80%, 0.12) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(260, 45%, 78%, 0.1) 0%, transparent 50%)",
    ],
    dark: [
      "radial-gradient(circle, hsla(280, 55%, 38%, 0.18) 0%, transparent 60%)",
      "radial-gradient(circle, hsla(340, 50%, 42%, 0.15) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(260, 50%, 35%, 0.12) 0%, transparent 50%)",
    ],
    twilight: [
      "radial-gradient(circle, hsla(38, 70%, 55%, 0.22) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(260, 45%, 35%, 0.18) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(32, 65%, 50%, 0.16) 0%, transparent 50%)",
    ],
    ocean: [
      "radial-gradient(circle, hsla(180, 55%, 48%, 0.2) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(195, 50%, 38%, 0.18) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(175, 60%, 45%, 0.15) 0%, transparent 50%)",
    ],
    forest: [
      "radial-gradient(circle, hsla(145, 45%, 45%, 0.2) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(135, 40%, 35%, 0.18) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(140, 50%, 40%, 0.15) 0%, transparent 50%)",
    ],
    midnight: [
      "radial-gradient(circle, hsla(215, 30%, 35%, 0.15) 0%, transparent 60%)",
      "radial-gradient(circle, hsla(220, 25%, 40%, 0.12) 0%, transparent 55%)",
      "radial-gradient(circle, hsla(210, 30%, 32%, 0.1) 0%, transparent 50%)",
    ],
  };

  const themeOrbs = orbConfigs[theme] || orbConfigs.light;
  return themeOrbs[orbIndex - 1] || themeOrbs[0];
}

export default AuroraBackground;