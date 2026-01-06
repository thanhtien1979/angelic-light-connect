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
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
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

  // Generate angels with fixed zones - 6 distinct areas spread across the entire screen
  const angels = useMemo<Angel[]>(() => {
    const count = Math.min(settings.angelCount, allAngelImages.length);

    // 6 fixed zones covering the entire screen - well separated
    // Layout: 3 columns x 2 rows with gaps between them
    const fixedZones = [
      // Top row (y: 5-45%)
      { minX: 3, maxX: 28, minY: 3, maxY: 42, cx: 15, cy: 22 },    // Top-left
      { minX: 37, maxX: 63, minY: 3, maxY: 38, cx: 50, cy: 20 },   // Top-center  
      { minX: 72, maxX: 97, minY: 3, maxY: 42, cx: 85, cy: 22 },   // Top-right
      // Bottom row (y: 55-95%)
      { minX: 3, maxX: 28, minY: 58, maxY: 97, cx: 15, cy: 78 },   // Bottom-left
      { minX: 37, maxX: 63, minY: 62, maxY: 97, cx: 50, cy: 80 },  // Bottom-center
      { minX: 72, maxX: 97, minY: 58, maxY: 97, cx: 85, cy: 78 },  // Bottom-right
    ];

    // Always use all 6 fairies in order (no shuffle) so each fairy gets a unique zone
    const selectedAngels = allAngelImages.slice(0, count);

    return selectedAngels.map((angel, index) => {
      const zone = fixedZones[index];

      // Small random offset within zone center
      const jitterX = (Math.random() - 0.5) * 8;
      const jitterY = (Math.random() - 0.5) * 8;

      const startX = Math.max(zone.minX + 3, Math.min(zone.maxX - 3, zone.cx + jitterX));
      const startY = Math.max(zone.minY + 3, Math.min(zone.maxY - 3, zone.cy + jitterY));

      return {
        id: index,
        image: angel.src,
        size: settings.size * (0.85 + Math.random() * 0.3),
        startX,
        startY,
        minX: zone.minX,
        maxX: zone.maxX,
        minY: zone.minY,
        maxY: zone.maxY,
        duration: (30 + Math.random() * 20) / settings.speed,
        delay: index * 1.5,
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

  // Generate flight path - deterministic per fairy and clamped to its own zone
  const generateFlightPath = useCallback((angel: Angel) => {
    const rand01 = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const randBetween = (seed: number, min: number, max: number) => min + rand01(seed) * (max - min);

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const points: { x: string; y: string; scale: number; rotate: number }[] = [];
    const numPoints = 12;

    const base = angel.id + 1;

    const zoneSpanX = angel.maxX - angel.minX;
    const zoneSpanY = angel.maxY - angel.minY;

    const movementRangeX = zoneSpanX * randBetween(base * 11.1, 0.28, 0.42);
    const movementRangeY = zoneSpanY * randBetween(base * 12.2, 0.26, 0.4);

    const directionX = rand01(base * 13.3) > 0.5 ? 1 : -1;
    const directionY = rand01(base * 14.4) > 0.5 ? 1 : -1;

    const phaseX = randBetween(base * 15.5, 0, Math.PI * 2);
    const phaseY = randBetween(base * 16.6, 0, Math.PI * 2);

    const freqX = randBetween(base * 17.7, 0.85, 1.35);
    const freqY = randBetween(base * 18.8, 0.75, 1.25);

    for (let i = 0; i <= numPoints; i++) {
      const progress = i / numPoints;
      const isLanding = i % 4 === 0 && i > 0;

      const waveX = Math.sin(progress * Math.PI * 2 * freqX + phaseX) * movementRangeX * directionX;
      const waveY = Math.cos(progress * Math.PI * 1.6 * freqY + phaseY) * movementRangeY * directionY;

      const offsetX = randBetween(base * 101 + i * 7.7, -6, 6);
      const offsetY = randBetween(base * 202 + i * 8.8, -5, 5);

      const x = clamp(angel.startX + waveX + offsetX, angel.minX + 1.5, angel.maxX - 1.5);
      const y = clamp(angel.startY + waveY + offsetY, angel.minY + 1.5, angel.maxY - 1.5);

      const scale = isLanding ? 1.12 : randBetween(base * 303 + i * 9.9, 0.85, 1.08);
      const rotate = isLanding ? 0 : randBetween(base * 404 + i * 6.6, -25, 25);

      points.push({ x: `${x}%`, y: `${y}%`, scale, rotate });
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
                alt="Tiên bay"
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
