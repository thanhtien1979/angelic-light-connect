import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Import angel images
import angelTinker from "@/assets/flying-angel-tinker.png";
import angelGreen from "@/assets/flying-angel-green.png";
import angelGold from "@/assets/flying-angel-gold.png";
import angelHeart from "@/assets/flying-angel-heart.png";
import angelButterfly from "@/assets/flying-angel-butterfly.webp";

interface Angel {
  id: number;
  image: string;
  size: number;
  startX: number;
  startY: number;
  duration: number;
  delay: number;
  glowColor: string;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
}

const angelImages = [
  { src: angelTinker, glow: "rgba(144, 238, 144, 0.6)" },
  { src: angelGreen, glow: "rgba(34, 197, 94, 0.6)" },
  { src: angelGold, glow: "rgba(251, 191, 36, 0.6)" },
  { src: angelHeart, glow: "rgba(244, 114, 182, 0.6)" },
  { src: angelButterfly, glow: "rgba(251, 146, 60, 0.6)" },
];

const GlobalFlyingAngels = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Check for reduced motion preference and mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobile = window.innerWidth < 768;
    
    if (mediaQuery.matches || isMobile) {
      setIsEnabled(false);
    }

    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      if (window.innerWidth < 768) {
        setIsEnabled(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Generate angels with random positions
  const angels = useMemo<Angel[]>(() => {
    return angelImages.map((angel, index) => ({
      id: index,
      image: angel.src,
      size: 60 + Math.random() * 40, // 60-100px
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      duration: 25 + Math.random() * 20, // 25-45 seconds per cycle
      delay: index * 3,
      glowColor: angel.glow,
    }));
  }, []);

  // Generate sparkles periodically
  useEffect(() => {
    if (!isEnabled) return;

    const interval = setInterval(() => {
      const newSparkle: Sparkle = {
        id: Date.now() + Math.random(),
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        size: 3 + Math.random() * 5,
      };
      setSparkles((prev) => [...prev.slice(-15), newSparkle]);
    }, 800);

    return () => clearInterval(interval);
  }, [isEnabled, windowSize]);

  // Clean up old sparkles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSparkles((prev) => prev.slice(-10));
    }, 3000);
    return () => clearInterval(cleanup);
  }, []);

  // Generate flight path with landing points
  const generateFlightPath = useCallback((angel: Angel) => {
    const points = [];
    const numPoints = 8;
    
    for (let i = 0; i <= numPoints; i++) {
      // Create smooth curved path with some landing pauses
      const isLanding = i % 3 === 0 && i > 0;
      points.push({
        x: `${(angel.startX + (i * 100 / numPoints) + Math.sin(i * 0.5) * 30) % 100}%`,
        y: `${(angel.startY + Math.sin(i * 0.7) * 40 + 10) % 90}%`,
        scale: isLanding ? 1.1 : 0.9 + Math.random() * 0.2,
        rotate: isLanding ? 0 : -15 + Math.random() * 30,
      });
    }
    return points;
  }, []);

  if (!isEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Flying Angels */}
      {angels.map((angel) => {
        const flightPath = generateFlightPath(angel);
        
        return (
          <motion.div
            key={angel.id}
            className="absolute"
            initial={{
              x: `${angel.startX}%`,
              y: `${angel.startY}%`,
              scale: 0.8,
            }}
            animate={{
              x: flightPath.map((p) => p.x),
              y: flightPath.map((p) => p.y),
              scale: flightPath.map((p) => p.scale),
              rotate: flightPath.map((p) => p.rotate),
            }}
            transition={{
              duration: angel.duration,
              delay: angel.delay,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              times: flightPath.map((_, i) => i / (flightPath.length - 1)),
            }}
            style={{
              filter: `drop-shadow(0 0 12px ${angel.glowColor})`,
            }}
          >
            {/* Wing flutter animation */}
            <motion.img
              src={angel.image}
              alt="Flying angel"
              className="object-contain"
              style={{
                width: angel.size,
                height: angel.size,
              }}
              animate={{
                y: [0, -5, 0, 5, 0],
                rotateY: [0, 10, 0, -10, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Trail sparkles behind angel */}
            <motion.div
              className="absolute -z-10"
              style={{
                left: "50%",
                top: "100%",
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 4 + i * 2,
                    height: 4 + i * 2,
                    background: angel.glowColor,
                    left: -10 + i * 8,
                    top: i * 5,
                  }}
                  animate={{
                    opacity: [0.8, 0.2],
                    scale: [1, 0.3],
                    y: [0, 20],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.2,
                    repeat: Infinity,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Background sparkles */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute rounded-full bg-amber-300"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              width: sparkle.size,
              height: sparkle.size,
              boxShadow: "0 0 8px rgba(251, 191, 36, 0.8)",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GlobalFlyingAngels;
