import { useMemo, useEffect, useState } from "react";

// Optimized: Reduced from 25 sparkles to 10
// Uses pure CSS animation instead of Framer Motion

const MagicalSparkles = () => {
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Disable on mobile and respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth < 768 || prefersReducedMotion) {
      setIsEnabled(false);
    }
  }, []);

  // Reduced to 6 sparkles for better performance
  const sparkles = useMemo(() => 
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 6 + Math.random() * 6,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 2,
    })), []
  );

  if (!isEnabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle-fade"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: `${sparkle.delay}s`,
            animationDuration: `${sparkle.duration}s`,
            willChange: "transform, opacity",
          }}
        >
          {/* Simplified star using CSS */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full"
          >
            <path
              d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z"
              fill="url(#sparkleGradient)"
            />
            <defs>
              <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsla(0, 0%, 100%, 0.95)" />
                <stop offset="50%" stopColor="hsla(348, 80%, 90%, 0.9)" />
                <stop offset="100%" stopColor="hsla(340, 70%, 85%, 0.8)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ))}
    </div>
  );
};

export default MagicalSparkles;
