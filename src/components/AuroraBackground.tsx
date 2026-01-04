// Optimized: Deeper, richer aurora with subtle noise texture
// Respects light/dark/twilight/ocean/forest modes with smooth transitions

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const AuroraBackground = () => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine active theme
  const activeTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : "light";
  const isTwilight = activeTheme === "twilight";
  const isDark = activeTheme === "dark";
  const isOcean = activeTheme === "ocean";
  const isForest = activeTheme === "forest";
  const isLight = !isDark && !isTwilight && !isOcean && !isForest;

  // Noise SVG for all themes
  const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Light mode: soft rose-purple gradients */}
      {isLight && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `
                radial-gradient(ellipse 90% 60% at 20% 25%, hsla(280, 45%, 75%, 0.12) 0%, transparent 55%),
                radial-gradient(ellipse 70% 50% at 75% 65%, hsla(340, 55%, 80%, 0.1) 0%, transparent 50%),
                radial-gradient(ellipse 80% 70% at 50% 45%, hsla(260, 40%, 78%, 0.08) 0%, transparent 55%)
              `,
            }}
          />
          <div
            className="absolute inset-0 animate-aurora-flow transition-opacity duration-500"
            style={{
              background: `
                linear-gradient(
                  135deg,
                  hsla(280, 50%, 78%, 0.1) 0%,
                  transparent 28%,
                  hsla(340, 50%, 75%, 0.08) 48%,
                  transparent 68%,
                  hsla(260, 45%, 80%, 0.06) 100%
                )
              `,
              backgroundSize: "200% 200%",
              willChange: "background-position",
            }}
          />
          <div
            className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(280, 50%, 82%, 0.14) 0%, transparent 60%)",
              filter: "blur(35px)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(340, 50%, 80%, 0.12) 0%, transparent 55%)",
              filter: "blur(40px)",
            }}
          />
        </>
      )}

      {/* Dark mode: deeper indigo-purple layer */}
      {isDark && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `
                radial-gradient(ellipse 90% 60% at 20% 25%, hsla(280, 50%, 35%, 0.18) 0%, transparent 55%),
                radial-gradient(ellipse 70% 50% at 75% 65%, hsla(340, 45%, 40%, 0.14) 0%, transparent 50%),
                radial-gradient(ellipse 80% 70% at 50% 45%, hsla(260, 45%, 30%, 0.12) 0%, transparent 55%)
              `,
            }}
          />
          <div
            className="absolute inset-0 animate-aurora-flow transition-opacity duration-500"
            style={{
              background: `
                linear-gradient(
                  135deg,
                  hsla(280, 55%, 40%, 0.12) 0%,
                  transparent 28%,
                  hsla(340, 50%, 45%, 0.1) 48%,
                  transparent 68%,
                  hsla(260, 50%, 35%, 0.08) 100%
                )
              `,
              backgroundSize: "200% 200%",
              willChange: "background-position",
            }}
          />
          <div
            className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(280, 55%, 38%, 0.18) 0%, transparent 60%)",
              filter: "blur(35px)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(340, 50%, 42%, 0.15) 0%, transparent 55%)",
              filter: "blur(40px)",
            }}
          />
        </>
      )}

      {/* Twilight/Candlelight mode: warm amber + twilight indigo */}
      {isTwilight && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `
                radial-gradient(ellipse 85% 55% at 25% 30%, hsla(38, 65%, 50%, 0.18) 0%, transparent 50%),
                radial-gradient(ellipse 70% 50% at 70% 60%, hsla(260, 40%, 35%, 0.16) 0%, transparent 50%),
                radial-gradient(ellipse 90% 70% at 50% 50%, hsla(32, 55%, 45%, 0.12) 0%, transparent 55%),
                radial-gradient(ellipse 60% 40% at 80% 25%, hsla(45, 70%, 55%, 0.1) 0%, transparent 45%)
              `,
            }}
          />
          <div
            className="absolute inset-0 animate-aurora-flow transition-opacity duration-500"
            style={{
              background: `
                linear-gradient(
                  140deg,
                  hsla(38, 70%, 55%, 0.14) 0%,
                  transparent 25%,
                  hsla(260, 45%, 38%, 0.12) 45%,
                  transparent 65%,
                  hsla(32, 60%, 48%, 0.1) 100%
                )
              `,
              backgroundSize: "200% 200%",
              willChange: "background-position",
            }}
          />
          {/* Candlelight orbs */}
          <div
            className="absolute top-1/5 left-1/4 w-64 h-64 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(38, 70%, 55%, 0.22) 0%, transparent 55%)",
              filter: "blur(30px)",
            }}
          />
          <div
            className="absolute bottom-1/3 right-1/5 w-72 h-72 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(260, 45%, 35%, 0.18) 0%, transparent 55%)",
              filter: "blur(35px)",
            }}
          />
          <div
            className="absolute top-2/3 left-1/3 w-56 h-56 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(32, 65%, 50%, 0.16) 0%, transparent 50%)",
              filter: "blur(28px)",
            }}
          />
        </>
      )}

      {/* Ocean mode: calm teal/navy depths */}
      {isOcean && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `
                radial-gradient(ellipse 90% 60% at 20% 30%, hsla(180, 55%, 40%, 0.18) 0%, transparent 55%),
                radial-gradient(ellipse 75% 50% at 75% 60%, hsla(195, 50%, 35%, 0.16) 0%, transparent 50%),
                radial-gradient(ellipse 85% 70% at 50% 45%, hsla(210, 45%, 30%, 0.14) 0%, transparent 55%),
                radial-gradient(ellipse 55% 35% at 85% 20%, hsla(175, 60%, 45%, 0.1) 0%, transparent 45%)
              `,
            }}
          />
          <div
            className="absolute inset-0 animate-aurora-flow transition-opacity duration-500"
            style={{
              background: `
                linear-gradient(
                  130deg,
                  hsla(180, 55%, 45%, 0.14) 0%,
                  transparent 25%,
                  hsla(195, 50%, 38%, 0.12) 45%,
                  transparent 65%,
                  hsla(175, 55%, 42%, 0.1) 100%
                )
              `,
              backgroundSize: "200% 200%",
              willChange: "background-position",
            }}
          />
          {/* Ocean orbs - seafoam and teal */}
          <div
            className="absolute top-1/5 left-1/4 w-72 h-72 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(180, 55%, 48%, 0.2) 0%, transparent 55%)",
              filter: "blur(32px)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(195, 50%, 38%, 0.18) 0%, transparent 55%)",
              filter: "blur(38px)",
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(175, 60%, 45%, 0.15) 0%, transparent 50%)",
              filter: "blur(30px)",
            }}
          />
        </>
      )}

      {/* Forest mode: grounded green/sage depths */}
      {isForest && (
        <>
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: `
                radial-gradient(ellipse 90% 60% at 25% 30%, hsla(145, 45%, 38%, 0.18) 0%, transparent 55%),
                radial-gradient(ellipse 75% 50% at 70% 65%, hsla(135, 40%, 32%, 0.16) 0%, transparent 50%),
                radial-gradient(ellipse 85% 70% at 50% 45%, hsla(155, 40%, 28%, 0.14) 0%, transparent 55%),
                radial-gradient(ellipse 55% 35% at 80% 25%, hsla(140, 50%, 42%, 0.1) 0%, transparent 45%)
              `,
            }}
          />
          <div
            className="absolute inset-0 animate-aurora-flow transition-opacity duration-500"
            style={{
              background: `
                linear-gradient(
                  135deg,
                  hsla(145, 45%, 42%, 0.14) 0%,
                  transparent 25%,
                  hsla(135, 40%, 35%, 0.12) 45%,
                  transparent 65%,
                  hsla(140, 45%, 38%, 0.1) 100%
                )
              `,
              backgroundSize: "200% 200%",
              willChange: "background-position",
            }}
          />
          {/* Forest orbs - sage and moss */}
          <div
            className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(145, 45%, 45%, 0.2) 0%, transparent 55%)",
              filter: "blur(32px)",
            }}
          />
          <div
            className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(135, 40%, 35%, 0.18) 0%, transparent 55%)",
              filter: "blur(38px)",
            }}
          />
          <div
            className="absolute top-2/3 left-1/3 w-60 h-60 rounded-full transition-all duration-500"
            style={{
              background: "radial-gradient(circle, hsla(140, 50%, 40%, 0.15) 0%, transparent 50%)",
              filter: "blur(28px)",
            }}
          />
        </>
      )}

      {/* Subtle noise overlay for all themes */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          backgroundImage: noiseSvg,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: isLight ? 0.025 : 0.035,
          mixBlendMode: isLight ? "overlay" : "soft-light",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default AuroraBackground;
