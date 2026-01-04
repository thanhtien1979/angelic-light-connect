import { useState, useEffect } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import HeroSection from "@/components/HeroSection";
import SacredPillars from "@/components/SacredPillars";
import VisionMission from "@/components/VisionMission";
import FunEcosystemPlatforms from "@/components/FunEcosystemPlatforms";
import CamlyWhitepaper from "@/components/CamlyWhitepaper";
import MeditationPortal from "@/components/MeditationPortal";
import MiniMeditationPlayer from "@/components/MiniMeditationPlayer";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import GlobalAngelicAura from "@/components/GlobalAngelicAura";
import { GentleMeditationReminder } from "@/components/GentleMeditationReminder";
import QuickBreathingWidget from "@/components/QuickBreathingWidget";
import WeeklyReflectionPrompt from "@/components/WeeklyReflectionPrompt";
import WalletLinkBanner from "@/components/WalletLinkBanner";
import MagicalSparkles from "@/components/MagicalSparkles";
import AuroraBackground from "@/components/AuroraBackground";
import StardustTrail from "@/components/StardustTrail";

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
      {/* Aurora Background - Flowing gradient waves */}
      <AuroraBackground />
      
      {/* Global Angelic Aura - Divine presence throughout */}
      <GlobalAngelicAura />
      
      {/* Magical Sparkles - Twinkling stars */}
      <MagicalSparkles />
      
      {/* Stardust Trail - Follow cursor */}
      <StardustTrail />
      
      {/* Gentle Meditation Reminder */}
      <GentleMeditationReminder />
      
      {/* Navigation */}
      <NavigationHeader />
      
      {/* Content */}
      <main 
        className={`relative z-10 transition-all duration-500 ease-out motion-reduce:transition-none ${
          isAppReady 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-2'
        }`}
      >
        <HeroSection onOpenAuth={() => setIsAuthOpen(true)} />
        <SacredPillars />
        <VisionMission />
        <FunEcosystemPlatforms />
        <CamlyWhitepaper />
        <MeditationPortal />
        <Testimonials />
        <CallToAction />
        <Footer />
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Floating Mini Meditation Player */}
      <MiniMeditationPlayer />

      {/* Quick Breathing Widget */}
      <QuickBreathingWidget />

      {/* Weekly Reflection Prompt */}
      <WeeklyReflectionPrompt />

      {/* Wallet Link Banner */}
      <WalletLinkBanner />
    </div>
  );
};

export default Index;
