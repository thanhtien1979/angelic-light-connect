import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import defaultAngelVideo from "@/assets/angel-cursor-video.mp4";
import { AngelCursorColor, AngelCursorSize } from "@/hooks/useAngelCursorPreference";

interface AngelCursorProps {
  color?: AngelCursorColor;
  size?: AngelCursorSize;
  isEnabled?: boolean;
  customVideoUrl?: string | null;
}

interface Feather {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  scale: number;
}

// Color configurations
const colorConfigs: Record<AngelCursorColor, { filter: string; glow: string; featherColor: string; sparkleColor: string }> = {
  pink: {
    filter: "hue-rotate(-10deg) saturate(1.3) brightness(1.1)",
    glow: "0 0 20px rgba(255, 182, 193, 0.7), 0 0 40px rgba(255, 182, 193, 0.4)",
    featherColor: "rgba(255, 182, 193, 0.8)",
    sparkleColor: "#FFB6C1"
  },
  gold: {
    filter: "hue-rotate(30deg) saturate(1.5) brightness(1.2)",
    glow: "0 0 20px rgba(255, 215, 0, 0.7), 0 0 40px rgba(255, 215, 0, 0.4)",
    featherColor: "rgba(255, 215, 0, 0.8)",
    sparkleColor: "#FFD700"
  },
  white: {
    filter: "brightness(1.4) saturate(0.2)",
    glow: "0 0 25px rgba(255, 255, 255, 0.9), 0 0 50px rgba(255, 255, 255, 0.5)",
    featherColor: "rgba(255, 255, 255, 0.9)",
    sparkleColor: "#FFFFFF"
  },
  purple: {
    filter: "hue-rotate(270deg) saturate(1.3) brightness(1.1)",
    glow: "0 0 20px rgba(221, 160, 221, 0.7), 0 0 40px rgba(221, 160, 221, 0.4)",
    featherColor: "rgba(221, 160, 221, 0.8)",
    sparkleColor: "#DDA0DD"
  }
};

// Size configurations
const sizeConfigs: Record<AngelCursorSize, { className: string; offset: { x: number; y: number } }> = {
  small: { className: "w-10 h-10", offset: { x: 15, y: 20 } },
  medium: { className: "w-14 h-14", offset: { x: 20, y: 25 } },
  large: { className: "w-20 h-20", offset: { x: 28, y: 35 } }
};

const AngelCursor = memo(({ color = 'pink', size = 'medium', isEnabled = true, customVideoUrl = null }: AngelCursorProps) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [feathers, setFeathers] = useState<Feather[]>([]);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [lastX, setLastX] = useState(0);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const config = colorConfigs[color];
  const sizeConfig = sizeConfigs[size];

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

    // Spawn feathers occasionally (1 in 15 chance)
    if (Math.random() < 0.07 && !prefersReducedMotion) {
      setFeathers(prev => {
        if (prev.length >= 5) return prev;
        return [...prev, {
          id: Date.now(),
          x: newX + (Math.random() - 0.5) * 20,
          y: newY + 10,
          rotation: Math.random() * 360
        }];
      });
    }

    // Spawn sparkles more frequently (1 in 8 chance)
    if (Math.random() < 0.12 && !prefersReducedMotion) {
      setSparkles(prev => {
        if (prev.length >= 8) return prev;
        return [...prev, {
          id: Date.now() + Math.random(),
          x: newX + (Math.random() - 0.5) * 40,
          y: newY + (Math.random() - 0.5) * 40,
          scale: 0.5 + Math.random() * 0.5
        }];
      });
    }
  }, [lastX, prefersReducedMotion]);

  // Set up event listener
  useEffect(() => {
    if (isMobile || prefersReducedMotion || !isEnabled) return;

    let throttleTimer: NodeJS.Timeout | null = null;
    
    const throttledHandler = (e: MouseEvent) => {
      if (throttleTimer) return;
      throttleTimer = setTimeout(() => {
        handleMouseMove(e);
        throttleTimer = null;
      }, 16); // ~60fps
    };

    window.addEventListener('mousemove', throttledHandler);
    return () => {
      window.removeEventListener('mousemove', throttledHandler);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isMobile, prefersReducedMotion, isEnabled, handleMouseMove]);

  // Clean up feathers
  useEffect(() => {
    if (feathers.length === 0) return;
    
    const cleanup = setInterval(() => {
      setFeathers(prev => prev.slice(1));
    }, 800);

    return () => clearInterval(cleanup);
  }, [feathers.length]);

  // Clean up sparkles
  useEffect(() => {
    if (sparkles.length === 0) return;
    
    const cleanup = setInterval(() => {
      setSparkles(prev => prev.slice(1));
    }, 500);

    return () => clearInterval(cleanup);
  }, [sparkles.length]);

  // Don't render if disabled, on mobile, or if reduced motion preferred
  if (!isEnabled || isMobile || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {/* Main Angel */}
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
        
        {/* Angel video - with background removal using blend mode */}
        <video
          src={customVideoUrl || defaultAngelVideo}
          autoPlay
          loop
          muted
          playsInline
          className={`${sizeConfig.className} object-contain drop-shadow-lg pointer-events-none`}
          style={{
            filter: `${config.filter} contrast(1.1)`,
            transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            mixBlendMode: 'multiply',
            background: 'transparent',
          }}
        />
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

      {/* Feathers */}
      <AnimatePresence>
        {feathers.map((feather) => (
          <motion.div
            key={feather.id}
            className="absolute w-2 h-3 rounded-full"
            style={{
              left: feather.x,
              top: feather.y,
              background: `linear-gradient(180deg, ${config.featherColor} 0%, transparent 100%)`,
              boxShadow: `0 0 6px ${config.featherColor}`,
            }}
            initial={{ opacity: 0.8, scale: 1, rotate: feather.rotation }}
            animate={{ 
              opacity: 0, 
              y: 40, 
              rotate: feather.rotation + 180,
              scale: 0.5 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
});

AngelCursor.displayName = 'AngelCursor';

export default AngelCursor;
