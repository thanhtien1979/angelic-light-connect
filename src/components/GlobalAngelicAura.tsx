import { useMemo, useState, useEffect, memo } from "react";

// Optimized: Reduced particles, uses CSS animations, memoized
const GlobalAngelicAura = memo(() => {
  const [isEnabled, setIsEnabled] = useState(true);
  
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth < 768 || prefersReducedMotion) {
      setIsEnabled(false);
    }
  }, []);
  // Reduced to 4 particles for performance
  const particles = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => ({
      x: 15 + i * 22,
      y: 20 + (i % 2) * 55,
      size: 20 + i * 8,
      delay: i * 1.5,
      color: [
        "hsla(348, 80%, 75%, 0.2)",
        "hsla(350, 85%, 82%, 0.15)",
        "hsla(340, 70%, 88%, 0.25)",
        "hsla(345, 75%, 80%, 0.18)",
      ][i],
    })), []
  );

  // Reduced to 2 orbs
  const orbs = useMemo(() => [
    { x: 20, y: 25, size: 140, delay: 0, color: "hsla(348, 75%, 80%, 0.1)" },
    { x: 75, y: 65, size: 160, delay: 2, color: "hsla(340, 70%, 85%, 0.08)" },
  ], []);

  if (!isEnabled) return null;

  return (
    <>
      {/* Combined gradient layer - reduced from 3 separate motion.divs to 1 static */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
        style={{ willChange: "auto" }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 25%, hsla(348, 80%, 85%, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, hsla(340, 70%, 85%, 0.1) 0%, transparent 45%),
              radial-gradient(ellipse at 20% 60%, hsla(320, 60%, 90%, 0.08) 0%, transparent 40%)
            `,
          }}
        />
      </div>

      {/* Static gradient overlay - removed animation */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, hsla(348, 80%, 85%, 0.15) 0%, transparent 50%), 
            radial-gradient(ellipse at 100% 100%, hsla(340, 70%, 80%, 0.1) 0%, transparent 40%), 
            radial-gradient(ellipse at 0% 50%, hsla(350, 75%, 82%, 0.08) 0%, transparent 35%)
          `,
        }}
      />

      {/* Optimized orbs with CSS animation instead of Framer Motion */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {orbs.map((orb, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full animate-pulse-slow"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 60%)`,
              filter: `blur(${orb.size * 0.25}px)`,
              animationDelay: `${orb.delay}s`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
      
      {/* Optimized particles with CSS animation */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float-gentle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
              filter: `blur(${particle.size * 0.1}px)`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* Simplified vignette - static */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, hsla(340, 50%, 90%, 0.1) 100%)`,
        }}
      />
    </>
  );
});

GlobalAngelicAura.displayName = 'GlobalAngelicAura';

export default GlobalAngelicAura;
