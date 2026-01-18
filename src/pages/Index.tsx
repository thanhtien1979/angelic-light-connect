import { useState, useEffect, lazy, Suspense } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { BackgroundEffects } from "@/components/BackgroundEffects";

// Lazy load heavy components for better initial load
const SacredPillars = lazy(() => import("@/components/SacredPillars"));
const VisionMission = lazy(() => import("@/components/VisionMission"));
const FunEcosystemPlatforms = lazy(() => import("@/components/FunEcosystemPlatforms"));
const MeditationPortal = lazy(() => import("@/components/MeditationPortal"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const CallToAction = lazy(() => import("@/components/CallToAction"));

// Lazy load floating widgets
const MiniMeditationPlayer = lazy(() => import("@/components/MiniMeditationPlayer"));
const QuickBreathingWidget = lazy(() => import("@/components/QuickBreathingWidget"));
const WeeklyReflectionPrompt = lazy(() => import("@/components/WeeklyReflectionPrompt"));
const WalletLinkBanner = lazy(() => import("@/components/WalletLinkBanner"));
const GentleMeditationReminder = lazy(() => import("@/components/GentleMeditationReminder").then(m => ({ default: m.GentleMeditationReminder })));

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Trigger fade-in after first mount
    const timer = requestAnimationFrame(() => {
      setIsAppReady(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background effects - lazy loaded via wrapper */}
      <BackgroundEffects showAurora showAura showSparkles showStardust />
      
      {/* Gentle Meditation Reminder */}
      <Suspense fallback={null}>
        <GentleMeditationReminder />
      </Suspense>
      
      {/* Navigation - critical, not lazy */}
      <NavigationHeader />
      
      {/* Content */}
      <main 
        className={`relative z-10 transition-all duration-300 ease-out motion-reduce:transition-none ${
          isAppReady 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-1'
        }`}
      >
        {/* Hero is critical - not lazy */}
        <HeroSection onOpenAuth={() => setIsAuthOpen(true)} />
        
        {/* Below-fold content - lazy loaded */}
        <Suspense fallback={<div className="min-h-[50vh]" />}>
          <SacredPillars />
          <VisionMission />
          <FunEcosystemPlatforms />
          <MeditationPortal />
          <Testimonials />
          <CallToAction />
        </Suspense>
        
        <Footer />
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Floating widgets - lazy loaded after main content */}
      <Suspense fallback={null}>
        <MiniMeditationPlayer />
        <QuickBreathingWidget />
        <WeeklyReflectionPrompt />
        <WalletLinkBanner />
      </Suspense>
    </div>
  );
};

export default Index;
