// Optimized: Deeper, richer aurora with subtle noise texture
// Respects light/dark mode via CSS variables

const AuroraBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base gradient layer - deeper indigo/purple undertones */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 20% 25%, hsla(280, 45%, 75%, 0.12) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 75% 65%, hsla(340, 55%, 80%, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 80% 70% at 50% 45%, hsla(260, 40%, 78%, 0.08) 0%, transparent 55%)
          `,
        }}
      />

      {/* Dark mode deeper layer */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 20% 25%, hsla(280, 50%, 35%, 0.18) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 75% 65%, hsla(340, 45%, 40%, 0.14) 0%, transparent 50%),
            radial-gradient(ellipse 80% 70% at 50% 45%, hsla(260, 45%, 30%, 0.12) 0%, transparent 55%)
          `,
        }}
      />

      {/* Flowing aurora - CSS animation, richer colors */}
      <div
        className="absolute inset-0 animate-aurora-flow"
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

      {/* Dark mode aurora flow */}
      <div
        className="absolute inset-0 animate-aurora-flow hidden dark:block"
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

      {/* Static orbs with richer purple tones */}
      <div
        className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full dark:hidden"
        style={{
          background: "radial-gradient(circle, hsla(280, 50%, 82%, 0.14) 0%, transparent 60%)",
          filter: "blur(35px)",
        }}
      />
      <div
        className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full hidden dark:block"
        style={{
          background: "radial-gradient(circle, hsla(280, 55%, 38%, 0.18) 0%, transparent 60%)",
          filter: "blur(35px)",
        }}
      />

      <div
        className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full dark:hidden"
        style={{
          background: "radial-gradient(circle, hsla(340, 50%, 80%, 0.12) 0%, transparent 55%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full hidden dark:block"
        style={{
          background: "radial-gradient(circle, hsla(340, 50%, 42%, 0.15) 0%, transparent 55%)",
          filter: "blur(40px)",
        }}
      />

      {/* Subtle noise texture overlay - extremely low opacity */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.025,
          mixBlendMode: "overlay",
        }}
      />

      {/* Dark mode noise - slightly more visible */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
          opacity: 0.035,
          mixBlendMode: "soft-light",
        }}
      />
    </div>
  );
};

export default AuroraBackground;
