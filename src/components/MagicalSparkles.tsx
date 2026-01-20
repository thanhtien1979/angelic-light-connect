import { useMemo, useEffect, useState } from "react";

// Optimized: Minimal sparkles with pure CSS animation
const MagicalSparkles = () => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop with no reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth >= 1024 && !prefersReducedMotion) {
      setIsEnabled(true);
    }
  }, []);

  // Reduced to 4 sparkles for better performance
  const sparkles = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: 15 + i * 25,
      y: 20 + (i % 2) * 60,
      size: 8,
      delay: i * 1.5,
    })), []
  );

  if (!isEnabled) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[1] overflow-hidden"
      style={{ contain: "strict" }}
    >
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
            animationDuration: "5s",
            contain: "layout paint",
          }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(348, 80%, 90%, 0.8) 0%, transparent 70%)",
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default MagicalSparkles;
