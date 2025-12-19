import { useState } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import HeroSection from "@/components/HeroSection";
import SacredPillars from "@/components/SacredPillars";
import VisionMission from "@/components/VisionMission";
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

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Global Angelic Aura - Divine presence throughout */}
      <GlobalAngelicAura />
      
      {/* Gentle Meditation Reminder */}
      <GentleMeditationReminder />
      
      {/* Navigation */}
      <NavigationHeader />
      
      {/* Content */}
      <main className="relative z-10">
        <HeroSection onOpenAuth={() => setIsAuthOpen(true)} />
        <SacredPillars />
        <VisionMission />
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
