import { useState, useEffect, useCallback, useRef, memo, useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { AngelStyle, AngelColor, SparkleParticle, TrailPoint } from "./types";
import { ANGEL_STYLES, ANGEL_COLORS } from "./types";
import { AngelSVGMap } from "./AngelSVGs";
import SparkleParticles from "./SparkleParticles";
import LightTrail from "./LightTrail";

/**
 * AngelPresence - A gentle, sacred angelic presence that accompanies the user
 * Supports preview mode for settings display
 */

interface AngelPresenceProps {
  enabled?: boolean;
  style?: AngelStyle;
  color?: AngelColor;
  sparklesEnabled?: boolean;
  trailEnabled?: boolean;
  imageUrl?: string;
  /** Preview mode: disables cursor tracking, uses idle animation */
  previewMode?: boolean;
  /** Container size for preview mode */
  previewSize?: number;
}

const AngelPresence = memo(({
  enabled = true,
  style = 'classic',
  color = 'white',
  sparklesEnabled = true,
  trailEnabled = true,
  imageUrl,
  previewMode = false,
  previewSize = 120,
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
  const [previewPos, setPreviewPos] = useState({ x: previewSize / 2, y: previewSize / 2 });
  
  const isMobile = useIsMobile();

  // Get current style config
  const styleConfig = useMemo(() => 
    ANGEL_STYLES.find(s => s.id === style) || ANGEL_STYLES[0],
    [style]
  );

  // Get current color config
  const colorConfig = useMemo(() => 
    ANGEL_COLORS.find(c => c.id === color) || ANGEL_COLORS[0],
    [color]
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

  // Mouse move handler (only for non-preview mode)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (previewMode) return;
    prevPos.current = { ...targetPos.current };
    targetPos.current = { x: e.clientX, y: e.clientY };
  }, [previewMode]);

  // Preview mode idle animation
  useEffect(() => {
    if (!previewMode || !enabled) return;
    if (prefersReducedMotion) {
      setPreviewPos({ x: previewSize / 2, y: previewSize / 2 });
      return;
    }

    const centerX = previewSize / 2;
    const centerY = previewSize / 2;
    const radiusX = previewSize * 0.15;
    const radiusY = previewSize * 0.1;
    let angle = 0;
    const speed = 0.015;
    const sparkleInterval = 400;
    const trailInterval = 80;
    let lastSparkle = 0;
    let lastTrail = 0;

    const animate = () => {
      const now = Date.now();
      angle += speed;
      
      // Gentle figure-8 pattern
      const x = centerX + Math.sin(angle) * radiusX;
      const y = centerY + Math.sin(angle * 2) * radiusY;
      
      setPreviewPos({ x, y });

      // Spawn preview sparkles
      if (sparklesEnabled && now - lastSparkle > sparkleInterval) {
        if (Math.random() < 0.5) {
          lastSparkle = now;
          const offsetX = (Math.random() - 0.5) * 30;
          const offsetY = (Math.random() - 0.5) * 30;
          
          setSparkles(prev => {
            const newSparkle: SparkleParticle = {
              id: `preview-sparkle-${now}-${Math.random()}`,
              x: x + offsetX,
              y: y + offsetY,
              size: 6 + Math.random() * 6,
              opacity: 0.5 + Math.random() * 0.3,
              createdAt: now,
            };
            return [...prev.slice(-4), newSparkle];
          });
        }
      }

      // Add preview trail points
      if (trailEnabled && now - lastTrail > trailInterval) {
        lastTrail = now;
        setTrailPoints(prev => {
          const newPoint: TrailPoint = {
            id: `preview-trail-${now}`,
            x,
            y,
            opacity: 0.5,
            createdAt: now,
          };
          return [...prev.slice(-8), newPoint];
        });
      }

      // Clean up
      setSparkles(prev => prev.filter(s => now - s.createdAt < 1200));
      setTrailPoints(prev => prev.filter(p => now - p.createdAt < 400));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setSparkles([]);
      setTrailPoints([]);
    };
  }, [previewMode, enabled, prefersReducedMotion, previewSize, sparklesEnabled, trailEnabled]);

  // Main cursor animation loop (non-preview mode)
  useEffect(() => {
    if (previewMode || !enabled || isMobile || prefersReducedMotion) return;

    const easing = 0.12;
    const floatSpeed = 0.002;
    const floatAmplitude = 4;
    const sparkleInterval = 300;
    const trailInterval = 50;
    const maxSparkles = 8;
    const maxTrailPoints = 15;

    const animate = () => {
      const now = Date.now();
      floatOffset.current += floatSpeed;
      const floatY = Math.sin(floatOffset.current) * floatAmplitude;

      setDisplayPos(prev => {
        const dx = targetPos.current.x - prev.x;
        const dy = targetPos.current.y - prev.y;
        const speed = Math.sqrt(dx * dx + dy * dy);
        
        const newX = prev.x + dx * easing;
        const newY = prev.y + dy * easing + floatY * 0.1;

        if (sparklesEnabled && !prefersReducedMotion && now - lastSparkleTime.current > sparkleInterval) {
          if (Math.random() < 0.4) {
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

        if (trailEnabled && !prefersReducedMotion && speed > 2 && now - lastTrailTime.current > trailInterval) {
          lastTrailTime.current = now;
          const trailOpacity = Math.min(speed / 50, 0.8);
          
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

      setSparkles(prev => prev.filter(s => now - s.createdAt < 1500));
      setTrailPoints(prev => prev.filter(p => now - p.createdAt < 500));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [previewMode, enabled, isMobile, prefersReducedMotion, sparklesEnabled, trailEnabled]);

  // Set up mouse event listener (non-preview mode only)
  useEffect(() => {
    if (previewMode || !enabled || isMobile || prefersReducedMotion) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [previewMode, enabled, isMobile, prefersReducedMotion, handleMouseMove]);

  // Don't render cursor mode if disabled on mobile
  if (!previewMode && (!enabled || isMobile || prefersReducedMotion)) return null;

  // Preview mode render
  if (previewMode) {
    const angelSize = 36 * styleConfig.scale;
    const centerOffset = angelSize / 2;

    return (
      <div 
        className="relative overflow-hidden rounded-xl"
        style={{ 
          width: previewSize, 
          height: previewSize,
          background: 'radial-gradient(circle at center, hsl(var(--muted)/0.3) 0%, transparent 70%)',
        }}
        aria-hidden="true"
        role="presentation"
      >
        {/* Light Trail */}
        {trailEnabled && <LightTrail points={trailPoints} color={color} />}
        
        {/* Sparkle Particles */}
        {sparklesEnabled && <SparkleParticles particles={sparkles} color={color} />}
        
        {/* Angel Container */}
        <div
          className="absolute transition-none"
          style={{
            left: previewPos.x - centerOffset,
            top: previewPos.y - centerOffset,
            willChange: 'transform',
          }}
        >
          {/* Soft Ambient Glow with selected color */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${colorConfig.glowColor} 0%, transparent 70%)`,
              transform: 'scale(2.5)',
              filter: `blur(${6 * styleConfig.glowIntensity}px)`,
              opacity: styleConfig.glowIntensity * 0.8,
            }}
          />
          
          {/* Angel Visual */}
          <div style={{ transform: `scale(${styleConfig.scale * 0.75})` }}>
            <AngelSVG />
          </div>
        </div>
      </div>
    );
  }

  // Full cursor mode render
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
      {trailEnabled && <LightTrail points={trailPoints} color={color} />}
      
      {/* Sparkle Particles */}
      {sparklesEnabled && <SparkleParticles particles={sparkles} color={color} />}
      
      {/* Angel Container */}
      <div
        className="absolute transition-none"
        style={{
          left: displayPos.x - centerOffset,
          top: displayPos.y - centerOffset + floatY,
          willChange: 'transform',
        }}
      >
        {/* Soft Ambient Glow with selected color */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colorConfig.glowColor} 0%, rgba(255,255,255,0.2) 40%, transparent 70%)`,
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
