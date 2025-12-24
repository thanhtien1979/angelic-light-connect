import { useMemo } from "react";
import { motion } from "framer-motion";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

const MagicalSparkles = () => {
  const sparkles = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            delay: sparkle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Four-pointed star sparkle */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"
              fill="url(#sparkleGradient)"
              className="drop-shadow-[0_0_4px_hsla(348,80%,80%,0.8)]"
            />
            <defs>
              <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.95)" />
                <stop offset="50%" stopColor="hsla(348, 80%, 90%, 0.9)" />
                <stop offset="100%" stopColor="hsla(340, 70%, 85%, 0.8)" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

export default MagicalSparkles;
