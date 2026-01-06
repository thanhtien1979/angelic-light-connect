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

  // Generate angels with unique dispersed positions across the viewport
  const angels = useMemo<Angel[]>(() => {
    const count = Math.min(settings.angelCount, allAngelImages.length);
    const selectedAngels = allAngelImages.slice(0, count);
    const minDistance = 15; // Minimum 15% distance between angels (roughly 120-180px on typical screens)
    
    // Generate unique spawn positions with minimum spacing
    const generateSpawnPositions = (n: number): { x: number; y: number }[] => {
      const positions: { x: number; y: number }[] = [];
      const maxAttempts = 100;
      
      // Predefined well-distributed starting points as fallback
      const fallbackPositions = [
        { x: 15, y: 20 },   // Top-left area
        { x: 80, y: 15 },   // Top-right area
        { x: 50, y: 35 },   // Center-top
        { x: 20, y: 65 },   // Bottom-left area
        { x: 75, y: 70 },   // Bottom-right area
        { x: 45, y: 55 },   // Center
      ];
      
      for (let i = 0; i < n; i++) {
        let bestPosition = fallbackPositions[i] || { x: 50, y: 50 };
        let found = false;
        
        for (let attempt = 0; attempt < maxAttempts && !found; attempt++) {
          // Random position within safe bounds: x: 10-90%, y: 10-80%
          const x = 10 + Math.random() * 80;
          const y = 10 + Math.random() * 70;
          
          // Check distance from all existing positions
          let tooClose = false;
          for (const pos of positions) {
            const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
            if (dist < minDistance) {
              tooClose = true;
              break;
            }
          }
          
          if (!tooClose) {
            bestPosition = { x, y };
            found = true;
          }
        }
        
        positions.push(bestPosition);
      }
      
      return positions;
    };
    
    const spawnPositions = generateSpawnPositions(count);

    return selectedAngels.map((angel, index) => {
      const spawn = spawnPositions[index];
      
      // Each angel gets a unique direction angle (0-360 degrees, evenly distributed)
      const baseAngle = (index * (360 / count)) + Math.random() * 30;
      
      // Unique speed variation per angel
      const speedMultiplier = 0.8 + Math.random() * 0.4;
      
      return {
        id: index,
        image: angel.src,
        size: settings.size * (0.85 + Math.random() * 0.3),
        startX: spawn.x,
        startY: spawn.y,
        minX: 5,  // Allow movement across most of viewport
        maxX: 95,
        minY: 5,
        maxY: 85,
        duration: (35 + Math.random() * 25) * speedMultiplier / settings.speed,
        delay: index * 0.8 + Math.random() * 1.5,  // Staggered start times
        glowColor: angel.glow,
        angle: baseAngle,  // Store unique direction
      };
    });
  }, [settings.angelCount, settings.size, settings.speed]);

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

  // Generate natural floating path - each angel has unique direction and movement
  const generateFlightPath = useCallback((angel: Angel & { angle?: number }) => {
    const points: { x: string; y: string; scale: number; rotate: number }[] = [];
    const numPoints = 10;
    
    // Use angel's unique angle for primary direction
    const primaryAngle = ((angel.angle || 0) * Math.PI) / 180;
    
    // Create unique movement pattern based on angel ID
    const seed = angel.id + 1;
    const rand = (n: number) => {
      const x = Math.sin(seed * n) * 10000;
      return x - Math.floor(x);
    };
    
    // Movement amplitude - how far the angel drifts
    const driftAmplitudeX = 8 + rand(1.1) * 12;  // 8-20% drift
    const driftAmplitudeY = 6 + rand(2.2) * 10;  // 6-16% drift
    
    // Secondary wave patterns for natural feel
    const waveFreqX = 0.8 + rand(3.3) * 0.6;
    const waveFreqY = 0.6 + rand(4.4) * 0.5;
    const phaseOffsetX = rand(5.5) * Math.PI * 2;
    const phaseOffsetY = rand(6.6) * Math.PI * 2;
    
    // Direction influenced by unique angle
    const dirX = Math.cos(primaryAngle) > 0 ? 1 : -1;
    const dirY = Math.sin(primaryAngle) > 0 ? 1 : -1;
    
    for (let i = 0; i <= numPoints; i++) {
      const progress = i / numPoints;
      const fullCycle = progress * Math.PI * 2;
      
      // Primary drift motion following angel's unique direction
      const primaryDriftX = Math.sin(fullCycle * waveFreqX + phaseOffsetX) * driftAmplitudeX * dirX;
      const primaryDriftY = Math.cos(fullCycle * waveFreqY + phaseOffsetY) * driftAmplitudeY * dirY;
      
      // Secondary gentle wave for organic feel
      const secondaryX = Math.sin(fullCycle * 2.3 + seed) * 3;
      const secondaryY = Math.cos(fullCycle * 1.7 + seed * 0.5) * 2.5;
      
      // Calculate final position with soft boundary clamping
      let x = angel.startX + primaryDriftX + secondaryX;
      let y = angel.startY + primaryDriftY + secondaryY;
      
      // Soft boundary - curve back gently when approaching edges
      const edgeSoftness = 8; // Start curving 8% from edge
      if (x < angel.minX + edgeSoftness) {
        x = angel.minX + edgeSoftness - Math.pow((angel.minX + edgeSoftness - x) * 0.3, 0.8);
      } else if (x > angel.maxX - edgeSoftness) {
        x = angel.maxX - edgeSoftness + Math.pow((x - (angel.maxX - edgeSoftness)) * 0.3, 0.8);
      }
      if (y < angel.minY + edgeSoftness) {
        y = angel.minY + edgeSoftness - Math.pow((angel.minY + edgeSoftness - y) * 0.3, 0.8);
      } else if (y > angel.maxY - edgeSoftness) {
        y = angel.maxY - edgeSoftness + Math.pow((y - (angel.maxY - edgeSoftness)) * 0.3, 0.8);
      }
      
      // Clamp to absolute bounds
      x = Math.max(angel.minX, Math.min(angel.maxX, x));
      y = Math.max(angel.minY, Math.min(angel.maxY, y));
      
      // Gentle scale breathing
      const scale = 0.92 + Math.sin(fullCycle * 1.5 + seed * 0.7) * 0.1;
      
      // Subtle rotation that follows movement direction
      const rotate = Math.sin(fullCycle + phaseOffsetX) * 12 * dirX;
      
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
