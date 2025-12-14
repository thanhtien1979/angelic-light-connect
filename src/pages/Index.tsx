import { useState } from "react";
import NavigationHeader from "@/components/NavigationHeader";
import HeroSection from "@/components/HeroSection";
import SacredPillars from "@/components/SacredPillars";
import VisionMission from "@/components/VisionMission";
import ChatPortal from "@/components/ChatPortal";
import MeditationPortal from "@/components/MeditationPortal";
import MiniMeditationPlayer from "@/components/MiniMeditationPlayer";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      
      {/* Navigation */}
      <NavigationHeader />
      
      {/* Content */}
      <main className="relative z-10">
        <HeroSection />
        <SacredPillars />
        <VisionMission />
        <ChatPortal onOpenAuth={() => setIsAuthOpen(true)} />
        <MeditationPortal />
        <Testimonials />
        <CallToAction />
        <Footer />
      </main>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* Floating Mini Meditation Player */}
      <MiniMeditationPlayer />
    </div>
  );
};

export default Index;
