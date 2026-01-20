import { lazy, Suspense, memo, useEffect, useState } from "react";

// Lazy load all background effect components for proper code splitting
const AuroraBackground = lazy(() => import("@/components/AuroraBackground"));
const GlobalAngelicAura = lazy(() => import("@/components/GlobalAngelicAura"));
const MagicalSparkles = lazy(() => import("@/components/MagicalSparkles"));
const StardustTrail = lazy(() => import("@/components/StardustTrail"));

interface BackgroundEffectsProps {
  showAurora?: boolean;
  showAura?: boolean;
  showSparkles?: boolean;
  showStardust?: boolean;
}

export const BackgroundEffects = memo(({ 
  showAurora = true, 
  showAura = false, 
  showSparkles = false,
  showStardust = false 
}: BackgroundEffectsProps) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Delay rendering of effects for better initial load
    const timer = setTimeout(() => setShouldRender(true), 100);
    
    // Check device capability
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Skip all effects on mobile for performance
  if (!shouldRender || isMobile) return null;

  return (
    <Suspense fallback={null}>
      {showAurora && <AuroraBackground />}
      {showAura && <GlobalAngelicAura />}
      {showSparkles && <MagicalSparkles />}
      {showStardust && <StardustTrail />}
    </Suspense>
  );
});

BackgroundEffects.displayName = "BackgroundEffects";

export default BackgroundEffects;
