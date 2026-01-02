import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import angelVideo from "@/assets/angel-cursor-video.mp4";
import { AngelCursorColor } from "@/hooks/useAngelCursorPreference";

interface AngelCursorProps {
  color?: AngelCursorColor;
}

interface Feather {
  id: number;
  x: number;
  y: number;
  rotation: number;
}

// Color configurations
const colorConfigs: Record<AngelCursorColor, { filter: string; glow: string; featherColor: string }> = {
  pink: {
    filter: "hue-rotate(-10deg) saturate(1.3) brightness(1.1)",
    glow: "0 0 20px rgba(255, 182, 193, 0.7), 0 0 40px rgba(255, 182, 193, 0.4)",
    featherColor: "rgba(255, 182, 193, 0.8)"
  },
  gold: {
    filter: "hue-rotate(30deg) saturate(1.5) brightness(1.2)",
    glow: "0 0 20px rgba(255, 215, 0, 0.7), 0 0 40px rgba(255, 215, 0, 0.4)",
    featherColor: "rgba(255, 215, 0, 0.8)"
  },
  white: {
    filter: "brightness(1.4) saturate(0.2)",
    glow: "0 0 25px rgba(255, 255, 255, 0.9), 0 0 50px rgba(255, 255, 255, 0.5)",
    featherColor: "rgba(255, 255, 255, 0.9)"
  },
  purple: {
    filter: "hue-rotate(270deg) saturate(1.3) brightness(1.1)",
    glow: "0 0 20px rgba(221, 160, 221, 0.7), 0 0 40px rgba(221, 160, 221, 0.4)",
    featherColor: "rgba(221, 160, 221, 0.8)"
  }
};

const AngelCursor = memo(({ color = 'pink' }: AngelCursorProps) => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [feathers, setFeathers] = useState<Feather[]>([]);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [lastX, setLastX] = useState(0);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const config = colorConfigs[color];

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

    // Occasionally spawn a feather (1 in 15 chance)
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
  }, [lastX, prefersReducedMotion]);

  // Set up event listener
  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

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
  }, [isMobile, prefersReducedMotion, handleMouseMove]);

  // Clean up feathers
  useEffect(() => {
    if (feathers.length === 0) return;
    
    const cleanup = setInterval(() => {
      setFeathers(prev => prev.slice(1));
    }, 800);

    return () => clearInterval(cleanup);
  }, [feathers.length]);

  // Don't render on mobile or if reduced motion preferred
  if (isMobile || prefersReducedMotion) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
      {/* Main Angel */}
      <motion.div
        className="absolute"
        style={{
          left: position.x - 20,
          top: position.y - 25,
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
        
        {/* Angel video */}
        <video
          src={angelVideo}
          autoPlay
          loop
          muted
          playsInline
          className="w-14 h-14 object-contain drop-shadow-lg pointer-events-none"
          style={{
            filter: config.filter,
            transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        />
      </motion.div>

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
