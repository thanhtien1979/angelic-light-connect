import { useState } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import HeroSection from "@/components/HeroSection";
import SacredPillars from "@/components/SacredPillars";
import VisionMission from "@/components/VisionMission";
import FunEcosystemPlatforms from "@/components/FunEcosystemPlatforms";
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
import AngelPresence from "@/components/AngelPresence";
import { useAngelPresence } from "@/hooks/useAngelPresence";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { 
    isEnabled: angelPresenceEnabled, 
    style: angelStyle,
    sparklesEnabled,
    trailEnabled,
  } = useAngelPresence();

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
      
      {/* Angel Presence - Gentle angelic companion */}
      <AngelPresence 
        enabled={angelPresenceEnabled} 
        style={angelStyle}
        sparklesEnabled={sparklesEnabled}
        trailEnabled={trailEnabled}
      />
      
      {/* Gentle Meditation Reminder */}
      <GentleMeditationReminder />
      
      {/* Navigation */}
      <NavigationHeader />
      
      {/* Content */}
      <main className="relative z-10">
        <HeroSection onOpenAuth={() => setIsAuthOpen(true)} />
        <SacredPillars />
        <VisionMission />
        <FunEcosystemPlatforms />
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
