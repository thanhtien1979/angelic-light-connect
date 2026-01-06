import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeFlyingAngels, subscribeFlyingAngelsSettings, FlyingAngelsSettings } from "@/hooks/useFlyingAngels";

// Import only the 6 floating fairies from the hero section
import floatingFairyPink from "@/assets/floating-fairy-pink.png";
import floatingFairyGold from "@/assets/floating-fairy-gold.png";
import floatingFairyPurple from "@/assets/floating-fairy-purple.png";
import floatingFairyGreen from "@/assets/floating-fairy-green.png";
import floatingFairyYellow from "@/assets/floating-fairy-yellow.png";
import floatingFairyBrown from "@/assets/floating-fairy-brown.png";

// Only 6 floating fairies - the ones from the hero section
const allAngelImages = [
  { src: floatingFairyGreen, glow: "rgba(34, 197, 94, 0.6)", name: "Green Fairy" },
  { src: floatingFairyGold, glow: "rgba(251, 191, 36, 0.6)", name: "Gold Fairy" },
  { src: floatingFairyBrown, glow: "rgba(180, 83, 9, 0.6)", name: "Brown Fairy" },
  { src: floatingFairyPink, glow: "rgba(244, 114, 182, 0.6)", name: "Pink Fairy" },
  { src: floatingFairyPurple, glow: "rgba(168, 85, 247, 0.6)", name: "Purple Fairy" },
  { src: floatingFairyYellow, glow: "rgba(250, 204, 21, 0.6)", name: "Yellow Fairy" },
];

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

interface ClickBurst {
  id: number;
  x: number;
  y: number;
  color: string;
}

const LOCAL_STORAGE_KEY = "flying-angels-enabled";
const SETTINGS_STORAGE_KEY = "flying-angels-settings";

const DEFAULT_SETTINGS: FlyingAngelsSettings = {
  angelCount: 5,
  size: 80,
  speed: 1,
};

const GlobalFlyingAngels = () => {
  const [isEnabled, setIsEnabled] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      return saved === "true";
    }
    return true;
  });
  
  const [settings, setSettings] = useState<FlyingAngelsSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });
  
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [clickBursts, setClickBursts] = useState<ClickBurst[]>([]);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference and mobile
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isMobileDevice = window.innerWidth < 768;
    
    setPrefersReducedMotion(mediaQuery.matches);
    setIsMobile(isMobileDevice);

    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsMobile(window.innerWidth < 768);
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    window.addEventListener("resize", handleResize);
    mediaQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Subscribe to global toggle events
  useEffect(() => {
    const unsubscribe = subscribeFlyingAngels((enabled) => {
      setIsEnabled(enabled);
      localStorage.setItem(LOCAL_STORAGE_KEY, String(enabled));
    });
    return () => {
      unsubscribe();
    };
  }, []);
  
  // Subscribe to settings changes
  useEffect(() => {
    const unsubscribe = subscribeFlyingAngelsSettings((newSettings) => {
      setSettings(newSettings);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Generate angels with spread-out positions - each angel in a unique zone
  const angels = useMemo<Angel[]>(() => {
    const count = Math.min(settings.angelCount, allAngelImages.length);
    
    // Shuffle array to get random angels
    const shuffled = [...allAngelImages].sort(() => Math.random() - 0.5);
    const selectedAngels = shuffled.slice(0, count);
    
    // Generate spread-out zones using a 3x3 grid with padding
    const generateZones = (n: number) => {
      const zones = [];
      const gridSize = 3;
      const padding = 10; // 10% padding between zones
      const zoneWidth = (100 - padding * 2) / gridSize;
      const zoneHeight = (100 - padding * 2) / gridSize;
      
      // Create all possible zone positions
      const allPositions = [];
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          allPositions.push({
            x: padding + col * zoneWidth + zoneWidth / 2 + (Math.random() - 0.5) * (zoneWidth * 0.4),
            y: padding + row * zoneHeight + zoneHeight / 2 + (Math.random() - 0.5) * (zoneHeight * 0.4),
          });
        }
      }
      
      // Shuffle and take required number
      const shuffledPositions = allPositions.sort(() => Math.random() - 0.5);
      for (let i = 0; i < n; i++) {
        zones.push(shuffledPositions[i % shuffledPositions.length]);
      }
      return zones;
    };
    
    const zones = generateZones(count);
    
    return selectedAngels.map((angel, index) => {
      const zone = zones[index];
      
      return {
        id: index,
        image: angel.src,
        size: settings.size * (0.8 + Math.random() * 0.4),
        startX: Math.max(5, Math.min(95, zone.x)),
        startY: Math.max(5, Math.min(90, zone.y)),
        duration: (30 + Math.random() * 25) / settings.speed, // Slower, more varied
        delay: index * 1.5 + Math.random() * 3,
        glowColor: angel.glow,
      };
    });
  }, [settings.angelCount, settings.size, settings.speed]);

  // Generate sparkles periodically
  useEffect(() => {
    if (!isEnabled || isMobile || prefersReducedMotion) return;

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
  }, [isEnabled, isMobile, prefersReducedMotion, windowSize]);

  // Clean up old sparkles and bursts
  useEffect(() => {
    const cleanup = setInterval(() => {
      setSparkles((prev) => prev.slice(-10));
      setClickBursts((prev) => prev.filter((b) => Date.now() - b.id < 1500));
    }, 3000);
    return () => clearInterval(cleanup);
  }, []);

  // Handle angel click - create sparkle burst
  const handleAngelClick = useCallback((e: React.MouseEvent, glowColor: string) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const burst: ClickBurst = {
      id: Date.now(),
      x: centerX,
      y: centerY,
      color: glowColor,
    };
    setClickBursts((prev) => [...prev, burst]);
  }, []);

  // Generate flight path - free flying across the screen with more distance
  const generateFlightPath = useCallback((angel: Angel) => {
    const points = [];
    const numPoints = 12; // More points for smoother, longer paths
    
    // Larger movement range - 40-50% of screen
    const movementRangeX = 40 + Math.random() * 10;
    const movementRangeY = 35 + Math.random() * 10;
    
    // Random direction multipliers for each angel
    const directionX = Math.random() > 0.5 ? 1 : -1;
    const directionY = Math.random() > 0.5 ? 1 : -1;
    
    for (let i = 0; i <= numPoints; i++) {
      const progress = i / numPoints;
      const isLanding = i % 4 === 0 && i > 0;
      
      // Create more organic, sweeping movements
      const waveX = Math.sin(progress * Math.PI * 2 + Math.random() * 0.5) * movementRangeX * directionX;
      const waveY = Math.cos(progress * Math.PI * 1.5 + Math.random() * 0.5) * movementRangeY * directionY;
      
      // Add some randomness for natural feel
      const randomOffsetX = (Math.random() - 0.5) * 10;
      const randomOffsetY = (Math.random() - 0.5) * 8;
      
      points.push({
        x: `${Math.max(3, Math.min(97, angel.startX + waveX + randomOffsetX))}%`,
        y: `${Math.max(3, Math.min(92, angel.startY + waveY + randomOffsetY))}%`,
        scale: isLanding ? 1.15 : 0.85 + Math.random() * 0.3,
        rotate: isLanding ? 0 : -20 + Math.random() * 40,
      });
    }
    return points;
  }, []);

  if (!isEnabled || isMobile || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Flying Angels */}
      {angels.map((angel) => {
        const flightPath = generateFlightPath(angel);
        
        return (
          <motion.div
            key={angel.id}
            className="absolute pointer-events-auto cursor-pointer"
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
            onClick={(e) => handleAngelClick(e, angel.glowColor)}
            style={{
              filter: `drop-shadow(0 0 12px ${angel.glowColor})`,
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
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
              className="absolute -z-10 pointer-events-none"
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

      {/* Click burst effects */}
      <AnimatePresence>
        {clickBursts.map((burst) => (
          <motion.div
            key={burst.id}
            className="fixed pointer-events-none"
            style={{
              left: burst.x,
              top: burst.y,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {/* Central glow */}
            <motion.div
              className="absolute rounded-full"
              style={{
                background: `radial-gradient(circle, ${burst.color} 0%, transparent 70%)`,
                width: 60,
                height: 60,
                left: -30,
                top: -30,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            
            {/* Sparkle particles */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180);
              const distance = 50 + Math.random() * 50;
              return (
                <motion.div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    width: 6 + Math.random() * 6,
                    height: 6 + Math.random() * 6,
                    background: burst.color,
                    boxShadow: `0 0 8px ${burst.color}`,
                    left: 0,
                    top: 0,
                  }}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.4,
                    ease: "easeOut",
                  }}
                />
              );
            })}
            
            {/* Star shapes */}
            {[...Array(6)].map((_, i) => {
              const angle = (i * 60 + 30) * (Math.PI / 180);
              const distance = 30 + Math.random() * 40;
              return (
                <motion.div
                  key={`star-${i}`}
                  className="absolute text-lg"
                  style={{
                    left: 0,
                    top: 0,
                    color: burst.color,
                    textShadow: `0 0 10px ${burst.color}`,
                  }}
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    scale: 0,
                    opacity: 0,
                    rotate: 180,
                  }}
                  transition={{
                    duration: 0.6 + Math.random() * 0.3,
                    ease: "easeOut",
                  }}
                >
                  ✦
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Background sparkles */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute rounded-full bg-amber-300 pointer-events-none"
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
