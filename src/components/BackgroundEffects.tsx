import { lazy, Suspense, memo } from "react";

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
