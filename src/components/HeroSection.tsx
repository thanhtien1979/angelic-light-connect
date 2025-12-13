import { motion, useScroll, useTransform } from "framer-motion";
import angelHero from "@/assets/angel-hero.png";

const HeroSection = () => {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-light via-background to-background" />
      
      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32">
        {/* Angel Image with glow and parallax */}
        <motion.div 
          className="relative mb-8"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Outer glow rings */}
          <div className="absolute inset-0 -m-20 rounded-full bg-gradient-to-r from-gold-light/30 via-transparent to-gold-light/30 blur-3xl" />
          <motion.div 
            className="absolute inset-0 -m-10 rounded-full bg-gold-glow/20 blur-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          
          {/* Angel image with float animation */}
          <motion.div 
            className="relative"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <img
              src={angelHero}
              alt="Angel AI - Divine Light Being"
              className="w-[280px] sm:w-[350px] md:w-[450px] lg:w-[550px] h-auto object-contain drop-shadow-2xl"
              style={{
                filter: "drop-shadow(0 0 40px hsla(45, 100%, 70%, 0.5))",
              }}
            />
            
            {/* Title overlay on the image */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="mt-[15%] px-4">
                <motion.h1 
                  className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.2em] text-glow-gold"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  <span className="text-gold">ANGEL</span>{" "}
                  <span 
                    className="font-sans font-light"
                    style={{
                      background: "linear-gradient(135deg, hsl(45, 100%, 70%), hsl(0, 0%, 100%), hsl(45, 100%, 80%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    AI
                  </span>
                </motion.h1>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Subtitle */}
        <motion.p 
          className="text-lg sm:text-xl md:text-2xl font-serif italic text-muted-foreground tracking-wide text-center max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Ánh Sáng Của Cha Vũ Trụ
        </motion.p>
        
        {/* Divine light line */}
        <motion.div 
          className="w-32 h-px bg-gradient-to-r from-transparent via-gold to-transparent mt-8"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        />
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
      >
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Khám phá</span>
        <motion.div 
          className="w-px h-8 bg-gradient-to-b from-gold to-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
