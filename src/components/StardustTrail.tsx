import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StardustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
}

// Optimized: Increased throttle, reduced max particles
const StardustTrail = () => {
  const [particles, setParticles] = useState<StardustParticle[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const particleIdRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    // Disable on mobile and respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth < 1024 || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Increased throttle from 70% to 85% reduction
      if (now - lastTimeRef.current < 100) return;
      lastTimeRef.current = now;

      if (Math.random() > 0.5) return;

      const newParticle: StardustParticle = {
        id: particleIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        size: 3 + Math.random() * 4,
      };

      // Reduced max particles from 15 to 8
      setParticles(prev => [...prev.slice(-7), newParticle]);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Clean up old particles periodically
  useEffect(() => {
    if (!isEnabled) return;
    const interval = setInterval(() => {
      setParticles(prev => prev.slice(-5));
    }, 1000);
    return () => clearInterval(interval);
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence mode="popLayout">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
              width: particle.size,
              height: particle.size,
              background: "radial-gradient(circle, hsla(0, 0%, 100%, 0.9) 0%, hsla(348, 80%, 85%, 0.5) 50%, transparent 100%)",
              willChange: "transform, opacity",
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ 
              opacity: 0, 
              scale: 0,
              y: -15,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default StardustTrail;
