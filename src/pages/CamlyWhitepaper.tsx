import NavigationHeader from "@/components/NavigationHeader";
import CamlyWhitepaperSection from "@/components/CamlyWhitepaper";
import Footer from "@/components/Footer";
import AuroraBackground from "@/components/AuroraBackground";
import GlobalAngelicAura from "@/components/GlobalAngelicAura";
import MagicalSparkles from "@/components/MagicalSparkles";

const CamlyWhitepaper = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <AuroraBackground />
      <GlobalAngelicAura />
      <MagicalSparkles />
      
      <NavigationHeader />
      
      <main className="relative z-10 pt-20">
        <CamlyWhitepaperSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default CamlyWhitepaper;
