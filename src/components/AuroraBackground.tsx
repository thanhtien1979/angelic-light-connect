// Optimized: Reduced from 5 animated layers to 2 static + 1 animated
// Removed blur filters on animated elements

const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Combined static gradient - replaces 2 animated divs */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, hsla(348, 80%, 85%, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 70%, hsla(340, 70%, 88%, 0.12) 0%, transparent 45%),
            radial-gradient(ellipse 70% 60% at 50% 50%, hsla(320, 60%, 90%, 0.08) 0%, transparent 50%)
          `,
        }}
      />

      {/* Single flowing aurora - CSS animation instead of Framer Motion */}
      <div
        className="absolute inset-0 animate-aurora-flow"
        style={{
          background: `
            linear-gradient(
              135deg,
              hsla(348, 75%, 88%, 0.12) 0%,
              transparent 30%,
              hsla(340, 65%, 85%, 0.08) 50%,
              transparent 70%,
              hsla(320, 55%, 90%, 0.06) 100%
            )
          `,
          backgroundSize: "200% 200%",
          willChange: "background-position",
        }}
      />

      {/* Simplified static orbs - no animation, just subtle presence */}
      <div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
        style={{
          background: "radial-gradient(circle, hsla(348, 80%, 90%, 0.12) 0%, transparent 60%)",
          filter: "blur(30px)",
        }}
      />

      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full"
        style={{
          background: "radial-gradient(circle, hsla(340, 70%, 88%, 0.1) 0%, transparent 55%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
};

export default AuroraBackground;
