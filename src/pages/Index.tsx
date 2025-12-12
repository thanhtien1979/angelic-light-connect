import FloatingParticles from "@/components/FloatingParticles";
import SacredGeometry from "@/components/SacredGeometry";
import HeroSection from "@/components/HeroSection";
import SacredPillars from "@/components/SacredPillars";
import VisionMission from "@/components/VisionMission";
import CallToAction from "@/components/CallToAction";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <SacredGeometry />
      <FloatingParticles />
      
      {/* Content */}
      <main className="relative z-10">
        <HeroSection />
        <SacredPillars />
        <VisionMission />
        <CallToAction />
        <Footer />
      </main>
    </div>
  );
};

export default Index;
