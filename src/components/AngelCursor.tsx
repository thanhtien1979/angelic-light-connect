import { useState, useEffect, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import flyingAngel1 from "@/assets/flying-angel.png";
import flyingAngel2 from "@/assets/flying-angel-2.png";
import flyingAngel3 from "@/assets/flying-angel-3.png";
import flyingAngel4 from "@/assets/flying-angel-4.png";
import { AngelCursorColor, AngelCursorSize, AngelCursorStyle } from "@/hooks/useAngelCursorPreference";

// Angel images by style - each style uses ONE specific image
export const angelStyleImages: Record<AngelCursorStyle, string> = {
  classic: flyingAngel1,
  cherub: flyingAngel2,
  seraph: flyingAngel3,
  guardian: flyingAngel4,
};

interface AngelCursorProps {
  color?: AngelCursorColor;
  size?: AngelCursorSize;
  style?: AngelCursorStyle;
  trailEnabled?: boolean;
  isEnabled?: boolean;
  customVideoUrl?: string | null;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  scale: number;
}

interface TrailPoint {
  id: number;
  x: number;
  y: number;
}

// Color configurations
const colorConfigs: Record<AngelCursorColor, { filter: string; glow: string; featherColor: string; sparkleColor: string; trailColor: string }> = {
  pink: {
    filter: "hue-rotate(-10deg) saturate(1.3) brightness(1.1)",
    glow: "0 0 20px rgba(255, 182, 193, 0.7), 0 0 40px rgba(255, 182, 193, 0.4)",
    featherColor: "rgba(255, 182, 193, 0.8)",
    sparkleColor: "#FFB6C1",
    trailColor: "rgba(255, 182, 193, 0.6)"
  },
  gold: {
    filter: "hue-rotate(30deg) saturate(1.5) brightness(1.2)",
    glow: "0 0 20px rgba(255, 215, 0, 0.7), 0 0 40px rgba(255, 215, 0, 0.4)",
    featherColor: "rgba(255, 215, 0, 0.8)",
    sparkleColor: "#FFD700",
    trailColor: "rgba(255, 215, 0, 0.6)"
  },
  white: {
    filter: "brightness(1.4) saturate(0.2)",
    glow: "0 0 25px rgba(255, 255, 255, 0.9), 0 0 50px rgba(255, 255, 255, 0.5)",
    featherColor: "rgba(255, 255, 255, 0.9)",
    sparkleColor: "#FFFFFF",
    trailColor: "rgba(255, 255, 255, 0.7)"
  },
  purple: {
    filter: "hue-rotate(270deg) saturate(1.3) brightness(1.1)",
    glow: "0 0 20px rgba(221, 160, 221, 0.7), 0 0 40px rgba(221, 160, 221, 0.4)",
    featherColor: "rgba(221, 160, 221, 0.8)",
    sparkleColor: "#DDA0DD",
    trailColor: "rgba(221, 160, 221, 0.6)"
  }
};

// Size configurations
const sizeConfigs: Record<AngelCursorSize, { className: string; offset: { x: number; y: number } }> = {
  small: { className: "w-10 h-10", offset: { x: 15, y: 20 } },
  medium: { className: "w-14 h-14", offset: { x: 20, y: 25 } },
  large: { className: "w-20 h-20", offset: { x: 28, y: 35 } }
};

const AngelCursor = memo(({ 
  color = 'pink', 
  size = 'medium', 
  style = 'classic',
  trailEnabled = true,
  isEnabled = true, 
  customVideoUrl = null 
}: AngelCursorProps) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [lastX, setLastX] = useState(0);
  const trailIdRef = useRef(0);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const config = colorConfigs[color];
  const sizeConfig = sizeConfigs[size];
  
  // Get the single angel image based on style
  const angelImage = angelStyleImages[style];

  // Handle mouse move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newX = e.clientX;
    const newY = e.clientY;

    setPosition({ x: newX, y: newY });

    // Update direction based on movement
    if (Math.abs(newX - lastX) > 5) {
      setDirection(newX > lastX ? 'right' : 'left');
      setLastX(newX);
    }

    // Add trail point
    if (trailEnabled && !prefersReducedMotion) {
      trailIdRef.current += 1;
      setTrail(prev => {
        const newTrail = [...prev, { id: trailIdRef.current, x: newX, y: newY }];
        return newTrail.slice(-15);
      });
    }

    // Spawn sparkles occasionally
    if (Math.random() < 0.1 && !prefersReducedMotion) {
      setSparkles(prev => {
        if (prev.length >= 6) return prev;
        return [...prev, {
          id: Date.now() + Math.random(),
          x: newX + (Math.random() - 0.5) * 40,
          y: newY + (Math.random() - 0.5) * 40,
          scale: 0.5 + Math.random() * 0.5
        }];
      });
    }
  }, [lastX, prefersReducedMotion, trailEnabled]);

  // Set up event listener
  useEffect(() => {
    if (isMobile || prefersReducedMotion || !isEnabled) return;

    let throttleTimer: NodeJS.Timeout | null = null;
    
    const throttledHandler = (e: MouseEvent) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        handleMouseMove(e);
        throttleTimer = null;
      }, 16);
    };

    window.addEventListener('mousemove', throttledHandler);
    return () => {
      window.removeEventListener('mousemove', throttledHandler);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isMobile, prefersReducedMotion, isEnabled, handleMouseMove]);

  // Clean up sparkles
  useEffect(() => {
    if (sparkles.length === 0) return;
    
    const cleanup = setInterval(() => {
      setSparkles(prev => prev.slice(1));
    }, 400);

    return () => clearInterval(cleanup);
  }, [sparkles.length]);

  // Clean up trail
  useEffect(() => {
    if (!trailEnabled || trail.length === 0) return;
    
    const cleanup = setInterval(() => {
      setTrail(prev => prev.slice(1));
    }, 50);

    return () => clearInterval(cleanup);
  }, [trail.length, trailEnabled]);

  // Don't render if disabled, on mobile, or if reduced motion preferred
  if (!isEnabled || isMobile || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {/* Light Trail */}
      {trailEnabled && (
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id={`trail-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={config.trailColor} stopOpacity="0" />
              <stop offset="50%" stopColor={config.trailColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={config.trailColor} stopOpacity="0.3" />
            </linearGradient>
            <filter id="trail-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {trail.length > 1 && (
            <motion.path
              d={`M ${trail.map(p => `${p.x},${p.y}`).join(' L ')}`}
              fill="none"
              stroke={`url(#trail-gradient-${color})`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#trail-glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.1 }}
            />
          )}
        </svg>
      )}

      {/* Trail particles */}
      <AnimatePresence>
        {trailEnabled && trail.map((point, index) => (
          <motion.div
            key={point.id}
            className="absolute rounded-full"
            style={{
              left: point.x,
              top: point.y,
              width: 4 + (index / trail.length) * 6,
              height: 4 + (index / trail.length) * 6,
              background: config.trailColor,
              boxShadow: `0 0 ${4 + index}px ${config.sparkleColor}`,
            }}
            initial={{ scale: 1, opacity: 0.8 }}
            animate={{ scale: 0.5, opacity: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </AnimatePresence>

      {/* Main Angel - ONLY ONE */}
      <motion.div
        className="absolute"
        style={{
          left: position.x - sizeConfig.offset.x,
          top: position.y - sizeConfig.offset.y,
          willChange: 'transform',
        }}
        animate={{
          y: [0, -6, 0],
          rotate: direction === 'left' ? [0, -5, 0] : [0, 5, 0],
        }}
        transition={{
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-md opacity-60"
          style={{
            background: `radial-gradient(circle, ${config.featherColor} 0%, transparent 70%)`,
            transform: 'scale(1.5)',
          }}
        />
        
        {/* Single Angel image or custom video */}
        {customVideoUrl ? (
          <video
            src={customVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className={`${sizeConfig.className} object-contain pointer-events-none`}
            style={{
              filter: `${config.filter} contrast(1.3) saturate(1.2) brightness(0.95)`,
              transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
              mixBlendMode: 'multiply',
            }}
          />
        ) : (
          <img
            src={angelImage}
            alt=""
            className={`${sizeConfig.className} object-contain pointer-events-none`}
            style={{
              filter: config.filter,
              transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          />
        )}
      </motion.div>

      {/* Sparkles */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{
              left: sparkle.x,
              top: sparkle.y,
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ 
              opacity: 0, 
              scale: sparkle.scale,
              rotate: 180
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path
                d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z"
                fill={config.sparkleColor}
                style={{
                  filter: `drop-shadow(0 0 3px ${config.sparkleColor})`
                }}
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

AngelCursor.displayName = 'AngelCursor';

export default AngelCursor;