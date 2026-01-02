import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AngelStyle, SparkleParticle, TrailPoint } from "./types";
import { ANGEL_STYLES } from "./types";
import { AngelSVGMap } from "./AngelSVGs";
import SparkleParticles from "./SparkleParticles";
import LightTrail from "./LightTrail";

/**
 * AngelPresence - A gentle, sacred angelic presence that accompanies the user
 */

interface AngelPresenceProps {
  enabled?: boolean;
  style?: AngelStyle;
  sparklesEnabled?: boolean;
  trailEnabled?: boolean;
  imageUrl?: string;
}

const AngelPresence = memo(({
  enabled = true,
  style = 'classic',
  sparklesEnabled = true,
  trailEnabled = true,
  imageUrl,
}: AngelPresenceProps) => {
  const [displayPos, setDisplayPos] = useState({ x: -100, y: -100 });
  const targetPos = useRef({ x: -100, y: -100 });
  const prevPos = useRef({ x: -100, y: -100 });
  const floatOffset = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastSparkleTime = useRef(0);
  const lastTrailTime = useRef(0);
  
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [sparkles, setSparkles] = useState<SparkleParticle[]>([]);
  const [trailPoints, setTrailPoints] = useState<TrailPoint[]>([]);
  
  const isMobile = useIsMobile();

  // Get current style config
  const styleConfig = useMemo(() => 
    ANGEL_STYLES.find(s => s.id === style) || ANGEL_STYLES[0],
    [style]
  );

  // Get angel component
  const AngelSVG = AngelSVGMap[style];

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    prevPos.current = { ...targetPos.current };
    targetPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Animation loop
  useEffect(() => {
    if (!enabled || isMobile || prefersReducedMotion) return;

    const easing = 0.12;
    const floatSpeed = 0.002;
    const floatAmplitude = 4;
    const sparkleInterval = 300; // ms between sparkle spawns
    const trailInterval = 50; // ms between trail points
    const maxSparkles = 8;
    const maxTrailPoints = 15;

    const animate = () => {
      const now = Date.now();
      floatOffset.current += floatSpeed;
      const floatY = Math.sin(floatOffset.current) * floatAmplitude;

      // Update display position with easing
      setDisplayPos(prev => {
        const dx = targetPos.current.x - prev.x;
        const dy = targetPos.current.y - prev.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        const newX = prev.x + dx * easing;
        const newY = prev.y + dy * easing + floatY * 0.1;

        // Spawn sparkles at low frequency
        if (sparklesEnabled && !prefersReducedMotion && now - lastSparkleTime.current > sparkleInterval) {
          if (Math.random() < 0.4) { // 40% chance each interval
            lastSparkleTime.current = now;
            const offsetX = (Math.random() - 0.5) * 60;
            const offsetY = (Math.random() - 0.5) * 60;
            
            setSparkles(prev => {
              const newSparkle: SparkleParticle = {
                id: `sparkle-${now}-${Math.random()}`,
                x: newX + offsetX,
                y: newY + offsetY,
                size: 8 + Math.random() * 8,
                opacity: 0.6 + Math.random() * 0.4,
                createdAt: now,
              };
              return [...prev.slice(-maxSparkles + 1), newSparkle];
            });
          }
        }

        // Add trail points based on movement
        if (trailEnabled && !prefersReducedMotion && speed > 2 && now - lastTrailTime.current > trailInterval) {
          lastTrailTime.current = now;
          const trailOpacity = Math.min(speed / 50, 0.8); // Opacity based on speed
          
          setTrailPoints(prev => {
            const newPoint: TrailPoint = {
              id: `trail-${now}`,
              x: newX,
              y: newY,
              opacity: trailOpacity,
              createdAt: now,
            };
            return [...prev.slice(-maxTrailPoints + 1), newPoint];
          });
        }

        return { x: newX, y: newY };
      });

      // Clean up old sparkles
      setSparkles(prev => prev.filter(s => now - s.createdAt < 1500));
      
      // Clean up old trail points
      setTrailPoints(prev => prev.filter(p => now - p.createdAt < 500));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, isMobile, prefersReducedMotion, sparklesEnabled, trailEnabled]);

  // Set up mouse event listener
  useEffect(() => {
    if (!enabled || isMobile || prefersReducedMotion) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, isMobile, prefersReducedMotion, handleMouseMove]);

  // Don't render if disabled
  if (!enabled || isMobile || prefersReducedMotion) return null;

  const floatY = Math.sin(floatOffset.current) * 4;
  const angelSize = 48 * styleConfig.scale;
  const centerOffset = angelSize / 2;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999]" 
      aria-hidden="true"
      role="presentation"
    >
      {/* Light Trail */}
      {trailEnabled && <LightTrail points={trailPoints} />}
      
      {/* Sparkle Particles */}
      {sparklesEnabled && <SparkleParticles particles={sparkles} />}
      
      {/* Angel Container */}
      <div
        className="absolute transition-none"
        style={{
          left: displayPos.x - centerOffset,
          top: displayPos.y - centerOffset + floatY,
          willChange: 'transform',
        }}
      >
        {/* Soft Ambient Glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${styleConfig.glowColor} 0%, rgba(255,255,255,0.2) 40%, transparent 70%)`,
            transform: 'scale(2)',
            filter: `blur(${8 * styleConfig.glowIntensity}px)`,
            opacity: styleConfig.glowIntensity,
          }}
        />
        
        {/* Angel Visual */}
        <div style={{ transform: `scale(${styleConfig.scale})` }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="w-12 h-12 object-contain"
              draggable={false}
            />
          ) : (
            <AngelSVG />
          )}
        </div>
      </div>
    </div>
  );
});

AngelPresence.displayName = 'AngelPresence';

export default AngelPresence;

// Re-export types and components for external use
export { default as AngelStyleGallery } from './AngelStyleGallery';
export * from './types';
