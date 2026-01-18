import NavigationHeader from "@/components/NavigationHeader";
import CamlyWhitepaperSection from "@/components/CamlyWhitepaper";
import Footer from "@/components/Footer";
import { BackgroundEffects } from "@/components/BackgroundEffects";

const CamlyWhitepaper = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <BackgroundEffects showAurora showAura showSparkles />
      
      <NavigationHeader />
      
      <main className="relative z-10 pt-20">
        <CamlyWhitepaperSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default CamlyWhitepaper;
