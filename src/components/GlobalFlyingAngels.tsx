import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeFlyingAngels, subscribeFlyingAngelsSettings, FlyingAngelsSettings } from "@/hooks/useFlyingAngels";

// Import angel images - original flying angels
import angelTinker from "@/assets/flying-angel-tinker.png";
import angelGreen from "@/assets/flying-angel-green.png";
import angelGold from "@/assets/flying-angel-gold.png";
import angelHeart from "@/assets/flying-angel-heart.png";
import angelButterfly from "@/assets/flying-angel-butterfly.webp";
import flyingAngel from "@/assets/flying-angel.png";
import flyingAngel2 from "@/assets/flying-angel-2.png";
import flyingAngel3 from "@/assets/flying-angel-3.png";
import flyingAngel4 from "@/assets/flying-angel-4.png";

// Import floating fairies
import floatingFairyPink from "@/assets/floating-fairy-pink.png";
import floatingFairyGold from "@/assets/floating-fairy-gold.png";
import floatingFairyPurple from "@/assets/floating-fairy-purple.png";
import floatingFairyGreen from "@/assets/floating-fairy-green.png";
import floatingFairyYellow from "@/assets/floating-fairy-yellow.png";
import floatingFairyBrown from "@/assets/floating-fairy-brown.png";

// All available angel/fairy images with their glow colors
const allAngelImages = [
  // Flying angels
  { src: angelTinker, glow: "rgba(144, 238, 144, 0.6)", name: "Tinker" },
  { src: angelGreen, glow: "rgba(34, 197, 94, 0.6)", name: "Green" },
  { src: angelGold, glow: "rgba(251, 191, 36, 0.6)", name: "Gold" },
  { src: angelHeart, glow: "rgba(244, 114, 182, 0.6)", name: "Heart" },
  { src: angelButterfly, glow: "rgba(251, 146, 60, 0.6)", name: "Butterfly" },
  { src: flyingAngel, glow: "rgba(255, 255, 255, 0.6)", name: "Classic" },
  { src: flyingAngel2, glow: "rgba(147, 197, 253, 0.6)", name: "Sky" },
  { src: flyingAngel3, glow: "rgba(253, 186, 116, 0.6)", name: "Sunset" },
  { src: flyingAngel4, glow: "rgba(196, 181, 253, 0.6)", name: "Lavender" },
  // Floating fairies
  { src: floatingFairyPink, glow: "rgba(244, 114, 182, 0.6)", name: "Pink Fairy" },
  { src: floatingFairyGold, glow: "rgba(251, 191, 36, 0.6)", name: "Gold Fairy" },
  { src: floatingFairyPurple, glow: "rgba(168, 85, 247, 0.6)", name: "Purple Fairy" },
  { src: floatingFairyGreen, glow: "rgba(34, 197, 94, 0.6)", name: "Green Fairy" },
  { src: floatingFairyYellow, glow: "rgba(250, 204, 21, 0.6)", name: "Yellow Fairy" },
  { src: floatingFairyBrown, glow: "rgba(180, 83, 9, 0.6)", name: "Brown Fairy" },
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

  // Generate angels with spread-out positions based on settings
  const angels = useMemo<Angel[]>(() => {
    const count = Math.min(settings.angelCount, allAngelImages.length);
    
    // Shuffle array to get random angels
    const shuffled = [...allAngelImages].sort(() => Math.random() - 0.5);
    const selectedAngels = shuffled.slice(0, count);
    
    // Generate spread-out zones based on count
    const generateZones = (n: number) => {
      const zones = [];
      const cols = Math.ceil(Math.sqrt(n));
      const rows = Math.ceil(n / cols);
      
      for (let i = 0; i < n; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        zones.push({
          x: 10 + (col / cols) * 75 + Math.random() * 10,
          y: 10 + (row / rows) * 70 + Math.random() * 10,
        });
      }
      return zones;
    };
    
    const zones = generateZones(count);
    
    return selectedAngels.map((angel, index) => {
      const zone = zones[index];
      
      return {
        id: index,
        image: angel.src,
        size: settings.size * (0.8 + Math.random() * 0.4), // ±20% variation
        startX: Math.max(5, Math.min(90, zone.x)),
        startY: Math.max(5, Math.min(85, zone.y)),
        duration: (25 + Math.random() * 20) / settings.speed, // Affected by speed
        delay: index * 2,
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

  // Generate flight path with landing points - limited range to prevent clustering
  const generateFlightPath = useCallback((angel: Angel) => {
    const points = [];
    const numPoints = 8;
    
    // Define a movement range based on starting position to keep angels in their zones
    const movementRange = 25; // Maximum 25% movement from starting position
    
    for (let i = 0; i <= numPoints; i++) {
      // Create smooth curved path within limited range
      const isLanding = i % 3 === 0 && i > 0;
      
      // Calculate position with limited movement range
      const xOffset = Math.sin(i * 0.8) * movementRange;
      const yOffset = Math.cos(i * 0.6) * (movementRange * 0.8);
      
      points.push({
        x: `${Math.max(5, Math.min(90, angel.startX + xOffset))}%`,
        y: `${Math.max(5, Math.min(85, angel.startY + yOffset))}%`,
        scale: isLanding ? 1.1 : 0.9 + Math.random() * 0.2,
        rotate: isLanding ? 0 : -15 + Math.random() * 30,
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
