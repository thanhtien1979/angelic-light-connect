import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * AngelPresence - A gentle, sacred angelic presence that accompanies the user
 * 
 * Core Features:
 * - Smooth cursor following with easing
 * - Soft ambient glow
 * - Performance optimized with requestAnimationFrame
 * - Auto-disabled on mobile/touch devices
 * - Respects prefers-reduced-motion
 * - Easy to disable
 */

interface AngelPresenceProps {
  /** Enable/disable the angel presence */
  enabled?: boolean;
  /** Custom angel image URL (optional) */
  imageUrl?: string;
}

// Default angel SVG as placeholder
const DefaultAngelSVG = memo(() => (
  <svg 
    width="48" 
    height="48" 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
  >
    {/* Halo */}
    <ellipse 
      cx="24" 
      cy="10" 
      rx="8" 
      ry="3" 
      stroke="rgba(255,255,255,0.9)" 
      strokeWidth="1.5"
      fill="none"
    />
    {/* Head */}
    <circle 
      cx="24" 
      cy="18" 
      r="6" 
      fill="rgba(255,245,238,0.95)"
    />
    {/* Body/Robe */}
    <path 
      d="M18 24 L24 44 L30 24 Q24 28 18 24Z" 
      fill="rgba(255,255,255,0.9)"
    />
    {/* Left Wing */}
    <path 
      d="M18 22 Q8 18 6 26 Q10 24 14 26 Q10 28 8 34 Q14 30 18 32 Q16 28 18 24Z" 
      fill="rgba(255,255,255,0.85)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="0.5"
    />
    {/* Right Wing */}
    <path 
      d="M30 22 Q40 18 42 26 Q38 24 34 26 Q38 28 40 34 Q34 30 30 32 Q32 28 30 24Z" 
      fill="rgba(255,255,255,0.85)"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="0.5"
    />
  </svg>
));

DefaultAngelSVG.displayName = 'DefaultAngelSVG';

const AngelPresence = memo(({ 
  enabled = true, 
  imageUrl 
}: AngelPresenceProps) => {
  // Current rendered position (smooth)
  const [displayPos, setDisplayPos] = useState({ x: -100, y: -100 });
  // Target position (actual cursor)
  const targetPos = useRef({ x: -100, y: -100 });
  // Float animation offset
  const floatOffset = useRef(0);
  // Animation frame reference
  const animationFrameRef = useRef<number | null>(null);
  // Check if user prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const isMobile = useIsMobile();

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Mouse move handler - only updates target position
  const handleMouseMove = useCallback((e: MouseEvent) => {
    targetPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    if (!enabled || isMobile || prefersReducedMotion) return;

    const easing = 0.12; // Smooth easing factor
    const floatSpeed = 0.002; // Gentle float speed
    const floatAmplitude = 4; // Subtle vertical movement

    const animate = () => {
      // Update float offset for gentle vertical motion
      floatOffset.current += floatSpeed;
      const floatY = Math.sin(floatOffset.current) * floatAmplitude;

      // Smooth interpolation towards target
      setDisplayPos(prev => {
        const dx = targetPos.current.x - prev.x;
        const dy = targetPos.current.y - prev.y;
        
        return {
          x: prev.x + dx * easing,
          y: prev.y + dy * easing + floatY * 0.1, // Add subtle float
        };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, isMobile, prefersReducedMotion]);

  // Set up mouse event listener
  useEffect(() => {
    if (!enabled || isMobile || prefersReducedMotion) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [enabled, isMobile, prefersReducedMotion, handleMouseMove]);

  // Don't render if disabled, on mobile, or reduced motion preferred
  if (!enabled || isMobile || prefersReducedMotion) return null;

  // Calculate gentle floating animation
  const floatY = Math.sin(floatOffset.current) * 4;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[9999]" 
      aria-hidden="true"
      role="presentation"
    >
      {/* Angel Container */}
      <div
        className="absolute transition-none"
        style={{
          left: displayPos.x - 24, // Center offset
          top: displayPos.y - 24 + floatY, // Center offset + float
          willChange: 'transform',
        }}
      >
        {/* Soft Ambient Glow */}
        <div 
          className="absolute inset-0 rounded-full opacity-60"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 40%, transparent 70%)',
            transform: 'scale(2)',
            filter: 'blur(8px)',
          }}
        />
        
        {/* Angel Visual */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="w-12 h-12 object-contain"
            draggable={false}
          />
        ) : (
          <DefaultAngelSVG />
        )}
      </div>
    </div>
  );
});

AngelPresence.displayName = 'AngelPresence';

export default AngelPresence;
