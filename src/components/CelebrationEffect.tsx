import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useEffect, useState } from "react";

interface CelebrationEffectProps {
  show: boolean;
  onComplete?: () => void;
  variant?: "petals" | "confetti" | "divine";
  duration?: number;
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  color: string;
  type: "petal" | "sparkle" | "star" | "heart";
}

const CelebrationEffect = ({ 
  show, 
  onComplete, 
  variant = "divine",
  duration = 4000 
}: CelebrationEffectProps) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  // Generate particles based on variant
  const particles = useMemo<Particle[]>(() => {
    const count = variant === "divine" ? 50 : 40;
    
    const petalColors = [
      "hsla(348, 80%, 85%, 0.9)",
      "hsla(340, 70%, 88%, 0.85)",
      "hsla(350, 75%, 82%, 0.9)",
      "hsla(320, 60%, 90%, 0.85)",
      "hsla(0, 0%, 100%, 0.95)",
    ];

    const confettiColors = [
      "hsla(348, 80%, 75%, 0.95)",
      "hsla(45, 100%, 75%, 0.95)",
      "hsla(340, 70%, 80%, 0.9)",
      "hsla(200, 70%, 75%, 0.9)",
      "hsla(280, 60%, 80%, 0.9)",
      "hsla(0, 0%, 100%, 0.95)",
    ];

    const types: Array<"petal" | "sparkle" | "star" | "heart"> = 
      variant === "petals" ? ["petal", "petal", "petal", "sparkle"] :
      variant === "confetti" ? ["sparkle", "star", "heart", "sparkle"] :
      ["petal", "sparkle", "star", "heart"];

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      size: 10 + Math.random() * 20,
      rotation: Math.random() * 360,
      color: variant === "confetti" 
        ? confettiColors[Math.floor(Math.random() * confettiColors.length)]
        : petalColors[Math.floor(Math.random() * petalColors.length)],
      type: types[Math.floor(Math.random() * types.length)],
    }));
  }, [variant]);

  // Generate burst sparkles from center
  const burstSparkles = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      angle: (i / 24) * Math.PI * 2,
      distance: 100 + Math.random() * 150,
      delay: Math.random() * 0.3,
      size: 4 + Math.random() * 6,
    })), []
  );

  const renderParticle = (particle: Particle) => {
    switch (particle.type) {
      case "petal":
        return (
          <svg viewBox="0 0 30 40" className="w-full h-full">
            <path
              d="M15 0 C25 8, 30 20, 25 35 C20 40, 10 40, 5 35 C0 20, 5 8, 15 0Z"
              fill={particle.color}
              className="drop-shadow-md"
            />
            <path
              d="M15 5 C20 10, 22 18, 20 28 C17 30, 13 30, 10 28 C8 18, 10 10, 15 5Z"
              fill="hsla(0, 0%, 100%, 0.4)"
            />
          </svg>
        );
      case "star":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"
              fill={particle.color}
              className="drop-shadow-sm"
            />
          </svg>
        );
      case "heart":
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full">
            <path
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              fill={particle.color}
              className="drop-shadow-sm"
            />
          </svg>
        );
      case "sparkle":
      default:
        return (
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `radial-gradient(circle, ${particle.color} 0%, transparent 70%)`,
              boxShadow: `0 0 8px ${particle.color}`,
            }}
          />
        );
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[100] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Central burst effect */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 2, 3],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div
              className="w-40 h-40 rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(45, 100%, 90%, 0.8) 0%, hsla(348, 80%, 85%, 0.4) 40%, transparent 70%)",
              }}
            />
          </motion.div>

          {/* Burst sparkles from center */}
          {burstSparkles.map((sparkle) => (
            <motion.div
              key={`burst-${sparkle.id}`}
              className="absolute top-1/2 left-1/2 rounded-full"
              style={{
                width: sparkle.size,
                height: sparkle.size,
                background: "radial-gradient(circle, hsla(45, 100%, 90%, 1) 0%, hsla(348, 80%, 85%, 0.8) 100%)",
                boxShadow: "0 0 10px hsla(45, 100%, 80%, 0.8)",
              }}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0, 
                opacity: 0 
              }}
              animate={{
                x: Math.cos(sparkle.angle) * sparkle.distance,
                y: Math.sin(sparkle.angle) * sparkle.distance,
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.2,
                delay: sparkle.delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Falling particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute"
              style={{
                left: `${particle.x}%`,
                top: "-10%",
                width: particle.size,
                height: particle.size * 1.3,
              }}
              initial={{ 
                y: 0, 
                x: 0,
                rotate: particle.rotation,
                opacity: 0,
              }}
              animate={{
                y: ["0vh", "120vh"],
                x: [0, Math.sin(particle.id) * 100],
                rotate: [particle.rotation, particle.rotation + 720],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: "easeIn",
              }}
            >
              {renderParticle(particle)}
            </motion.div>
          ))}

          {/* Glowing rings expanding */}
          {[0, 0.3, 0.6].map((delay, i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
              style={{
                borderColor: i === 0 
                  ? "hsla(45, 100%, 80%, 0.6)" 
                  : i === 1 
                    ? "hsla(348, 80%, 85%, 0.5)"
                    : "hsla(340, 70%, 88%, 0.4)",
              }}
              initial={{ 
                width: 0, 
                height: 0, 
                opacity: 0 
              }}
              animate={{
                width: [0, 400, 600],
                height: [0, 400, 600],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 1.5,
                delay,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Divine light rays */}
          {variant === "divine" && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              {Array.from({ length: 12 }, (_, i) => (
                <motion.div
                  key={`ray-${i}`}
                  className="absolute origin-center"
                  style={{
                    width: "3px",
                    height: "200px",
                    background: "linear-gradient(180deg, hsla(45, 100%, 85%, 0.8) 0%, transparent 100%)",
                    transform: `rotate(${i * 30}deg)`,
                    borderRadius: "2px",
                  }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{
                    scaleY: [0, 1, 1.5],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 1.2,
                    delay: 0.1 + i * 0.05,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CelebrationEffect;
