import { useEffect, useState, useRef, memo } from "react";

interface StardustParticle {
  id: number;
  x: number;
  y: number;
  size: number;
}

// Highly optimized: Uses CSS animations instead of Framer Motion
const StardustTrail = memo(() => {
  const [particles, setParticles] = useState<StardustParticle[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const particleIdRef = useRef(0);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    // Disable on mobile/tablet and respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth < 1024 || prefersReducedMotion) {
      setIsEnabled(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      // Heavier throttle: 250ms between particles (was 150ms)
      if (now - lastTimeRef.current < 250) return;
      lastTimeRef.current = now;

      // 70% chance to skip (was 60%)
      if (Math.random() > 0.3) return;

      const newParticle: StardustParticle = {
        id: particleIdRef.current++,
        x: e.clientX,
        y: e.clientY,
        size: 4 + Math.random() * 3,
      };

      // Max 3 particles (was 5)
      setParticles(prev => [...prev.slice(-2), newParticle]);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto cleanup after animation duration
  useEffect(() => {
    if (!isEnabled || particles.length === 0) return;
    
    const timer = setTimeout(() => {
      setParticles(prev => prev.slice(1));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isEnabled, particles.length]);

  if (!isEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-stardust-fade"
          style={{
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            background: "radial-gradient(circle, hsla(0, 0%, 100%, 0.85) 0%, hsla(348, 80%, 85%, 0.4) 50%, transparent 100%)",
          }}
        />
      ))}
      <style>{`
        @keyframes stardust-fade {
          0% { opacity: 0.8; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(0) translateY(-12px); }
        }
        .animate-stardust-fade {
          animation: stardust-fade 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
});

StardustTrail.displayName = 'StardustTrail';

export default StardustTrail;
