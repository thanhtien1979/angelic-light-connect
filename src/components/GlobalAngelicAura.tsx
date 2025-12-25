import { useMemo } from "react";
import { motion } from "framer-motion";

// Optimized: Reduced from 20 particles to 8, 6 orbs to 3
// Added GPU optimization with will-change

const GlobalAngelicAura = () => {
  // Reduced particle count for performance
  const particles = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 15 + Math.random() * 25,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
      color: [
        "hsla(348, 80%, 75%, 0.25)",
        "hsla(350, 85%, 82%, 0.2)",
        "hsla(340, 70%, 88%, 0.3)",
      ][i % 3],
    })), []
  );

  // Reduced orbs from 6 to 3
  const orbs = useMemo(() => 
    Array.from({ length: 3 }, (_, i) => ({
      x: 15 + i * 35,
      y: 20 + (i % 2) * 50,
      size: 120 + i * 40,
      delay: i * 2,
      color: [
        "hsla(348, 75%, 80%, 0.12)",
        "hsla(340, 70%, 85%, 0.1)",
        "hsla(320, 60%, 88%, 0.08)",
      ][i],
    })), []
  );

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
              filter: `blur(${particle.size * 0.12}px)`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>
      
      {/* Simplified vignette - static */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 50%, hsla(340, 50%, 90%, 0.12) 100%)`,
        }}
      />
    </>
  );
};

export default GlobalAngelicAura;
