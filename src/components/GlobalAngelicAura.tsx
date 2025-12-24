import { useMemo } from "react";
import { motion } from "framer-motion";

// Soft rose light particle
const FloatingParticle = ({ 
  x, y, size, delay, duration, color 
}: { 
  x: number; y: number; size: number; delay: number; duration: number; color: string 
}) => (
  <motion.div
    className="fixed rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: `blur(${size * 0.15}px)`,
    }}
    animate={{
      y: [0, -40, 0],
      x: [0, Math.sin(x) * 15, 0],
      opacity: [0.15, 0.35, 0.15],
      scale: [1, 1.15, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Glowing orb that pulses
const GlowingOrb = ({
  x, y, size, delay, color
}: {
  x: number; y: number; size: number; delay: number; color: string;
}) => (
  <motion.div
    className="fixed rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      background: `radial-gradient(circle, ${color} 0%, transparent 60%)`,
      filter: `blur(${size * 0.3}px)`,
    }}
    animate={{
      scale: [1, 1.3, 1],
      opacity: [0.2, 0.4, 0.2],
    }}
    transition={{
      duration: 5,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const GlobalAngelicAura = () => {
  // Generate subtle floating particles throughout the app
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 5,
      color: [
        "hsla(348, 80%, 75%, 0.35)",
        "hsla(350, 85%, 82%, 0.3)",
        "hsla(340, 70%, 88%, 0.4)",
        "hsla(349, 65%, 78%, 0.32)",
        "hsla(320, 60%, 85%, 0.28)",
      ][i % 5],
    })), []
  );

  // Generate glowing orbs
  const orbs = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 100 + Math.random() * 150,
      delay: Math.random() * 3,
      color: [
        "hsla(348, 75%, 80%, 0.15)",
        "hsla(340, 70%, 85%, 0.12)",
        "hsla(320, 60%, 88%, 0.1)",
      ][i % 3],
    })), []
  );

  return (
    <>
      {/* Ambient Sacred Breathing Glow - Enhanced */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <motion.div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-rose/[0.05] via-rose-light/[0.03] to-transparent blur-3xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-radial from-rose-soft/[0.04] to-transparent blur-3xl"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-radial from-primary/[0.03] to-transparent blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.25, 0.4, 0.25],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Fixed divine gradient overlay across entire app - Enhanced with shimmer */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 0%, hsla(348, 80%, 85%, 0.18) 0%, transparent 50%), 
            radial-gradient(ellipse at 100% 100%, hsla(340, 70%, 80%, 0.12) 0%, transparent 40%), 
            radial-gradient(ellipse at 0% 50%, hsla(350, 75%, 82%, 0.1) 0%, transparent 35%),
            radial-gradient(ellipse at 50% 100%, hsla(320, 60%, 88%, 0.08) 0%, transparent 40%)
          `,
        }}
        animate={{
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Glowing orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {orbs.map((orb, i) => (
          <GlowingOrb key={`orb-${i}`} {...orb} />
        ))}
      </div>
      
      {/* Subtle floating rose particles - Enhanced */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((particle, i) => (
          <FloatingParticle key={i} {...particle} />
        ))}
      </div>
      
      {/* Soft vignette for sacred atmosphere - Enhanced */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 50%, hsla(340, 50%, 90%, 0.18) 100%),
            linear-gradient(180deg, hsla(348, 80%, 95%, 0.05) 0%, transparent 20%, transparent 80%, hsla(348, 80%, 95%, 0.05) 100%)
          `,
        }}
      />

      {/* Shimmer overlay */}
      <motion.div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            linear-gradient(
              45deg,
              transparent 0%,
              hsla(0, 0%, 100%, 0.03) 25%,
              transparent 50%,
              hsla(0, 0%, 100%, 0.02) 75%,
              transparent 100%
            )
          `,
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </>
  );
};

export default GlobalAngelicAura;
