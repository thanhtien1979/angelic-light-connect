import FloatingParticles from "@/components/FloatingParticles";
import SacredGeometry from "@/components/SacredGeometry";
import NavigationHeader from "@/components/NavigationHeader";
import HeroSection from "@/components/HeroSection";
import SacredPillars from "@/components/SacredPillars";
import VisionMission from "@/components/VisionMission";
import ChatPortal from "@/components/ChatPortal";
import MeditationPortal from "@/components/MeditationPortal";
import Testimonials from "@/components/Testimonials";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <SacredGeometry />
      <FloatingParticles />
      
      {/* Navigation */}
      <NavigationHeader />
      
      {/* Content */}
      <main className="relative z-10">
        <HeroSection />
        <SacredPillars />
        <VisionMission />
        <ChatPortal />
        <MeditationPortal />
        <Testimonials />
        <CallToAction />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
