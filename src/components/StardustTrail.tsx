import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StardustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
}

const StardustTrail = () => {
  const [particles, setParticles] = useState<StardustParticle[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Disable on mobile for performance
    if (window.innerWidth < 768) {
      setIsEnabled(false);
      return;
    }

    let particleId = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Only create particle occasionally for performance
      if (Math.random() > 0.3) return;

      const newParticle: StardustParticle = {
        id: particleId++,
        x: e.clientX,
        y: e.clientY,
        size: 3 + Math.random() * 5,
      };

      setParticles(prev => [...prev.slice(-15), newParticle]);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!isEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              background: "radial-gradient(circle, hsla(0, 0%, 100%, 0.9) 0%, hsla(348, 80%, 85%, 0.6) 50%, transparent 100%)",
              boxShadow: "0 0 6px hsla(348, 80%, 80%, 0.6)",
            }}
            initial={{ opacity: 1, scale: 1 }}
            animate={{ 
              opacity: 0, 
              scale: 0,
              y: -20,
              x: (Math.random() - 0.5) * 30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default StardustTrail;
