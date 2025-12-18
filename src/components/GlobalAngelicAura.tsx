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
      filter: `blur(${size * 0.2}px)`,
    }}
    animate={{
      y: [0, -30, 0],
      x: [0, Math.sin(x) * 10, 0],
      opacity: [0.1, 0.25, 0.1],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

const GlobalAngelicAura = () => {
  // Generate subtle floating particles throughout the app
  const particles = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => ({
      x: 5 + Math.random() * 90,
      y: 5 + Math.random() * 90,
      size: 8 + Math.random() * 16,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
      color: [
        "hsla(348, 80%, 75%, 0.3)",
        "hsla(350, 85%, 82%, 0.25)",
        "hsla(340, 70%, 88%, 0.35)",
        "hsla(349, 65%, 78%, 0.28)",
      ][i % 4],
    })), []
  );

  return (
    <>
      {/* Ambient Sacred Breathing Glow - matches Profile page */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-radial from-gold/[0.03] via-rose-200/[0.02] to-transparent animate-ambient-breath blur-3xl"
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-radial from-amber-100/[0.025] to-transparent animate-ambient-breath blur-3xl"
          style={{ animationDelay: "-5s" }}
        />
      </div>

      {/* Fixed divine gradient overlay across entire app */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, hsla(348, 80%, 85%, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 100% 100%, hsla(340, 70%, 80%, 0.1) 0%, transparent 40%), radial-gradient(ellipse at 0% 50%, hsla(350, 75%, 82%, 0.08) 0%, transparent 35%)",
        }}
      />
      
      {/* Subtle floating rose particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {particles.map((particle, i) => (
          <FloatingParticle key={i} {...particle} />
        ))}
      </div>
      
      {/* Soft vignette for sacred atmosphere */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 60%, hsla(340, 50%, 90%, 0.15) 100%)",
        }}
      />
    </>
  );
};

export default GlobalAngelicAura;
