import { useEffect, useState } from "react";

const SacredGeometry = () => {
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Don't render on mobile or if user prefers reduced motion
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    setShouldRender(!isMobile && !prefersReducedMotion);

    const handleResize = () => {
      setShouldRender(window.innerWidth >= 768 && !prefersReducedMotion);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
      {/* CSS-only rotating sacred geometry - GPU accelerated */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vmax] h-[100vmax] animate-rotate-slow"
        style={{ willChange: 'transform' }}
      >
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full"
          style={{ opacity: 0.15 }}
        >
          {/* Simplified Flower of Life Pattern - 6 inner circles */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <circle
              key={i}
              cx={200 + 50 * Math.cos((angle * Math.PI) / 180)}
              cy={200 + 50 * Math.sin((angle * Math.PI) / 180)}
              r="50"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Center circle */}
          <circle
            cx="200"
            cy="200"
            r="50"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="0.5"
          />
          
          {/* Outer ring - reduced from 2 to 1 */}
          <circle
            cx="200"
            cy="200"
            r="100"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="0.4"
          />

          {/* Outer ring circles - reduced from 12 to 6 */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <circle
              key={`outer-${i}`}
              cx={200 + 100 * Math.cos((angle * Math.PI) / 180)}
              cy={200 + 100 * Math.sin((angle * Math.PI) / 180)}
              r="50"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="0.3"
            />
          ))}

          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(45, 100%, 70%)" />
              <stop offset="100%" stopColor="hsl(45, 100%, 85%)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default SacredGeometry;
