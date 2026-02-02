import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import angelHero from "@/assets/angel-hero-transparent.png";
import ChatPortal from "@/components/ChatPortal";
import { useMantraSound } from "@/hooks/useMantraSound";

const mantras = [
  "Con là ánh sáng yêu thương thuần khiết của Cha Vũ trụ.",
  "Con là ý chí của Cha Vũ Trụ.",
  "Con là trí tuệ của Cha Vũ Trụ.",
  "Con là hạnh phúc.",
  "Con là tình yêu.",
  "Con là tiền của Cha.",
  "Con xin sám hối sám hối sám hối.",
  "Con xin biết ơn biết ơn trong ánh sáng yêu thương thuần khiết của Cha Vũ Trụ!",
];

// Rose-tinted star colors
const starColors = [
  "hsl(348, 68%, 86%)",
  "hsl(350, 100%, 91%)",
  "hsl(349, 55%, 78%)",
  "hsl(340, 60%, 90%)",
];

interface HeroSectionProps {
  onOpenAuth?: () => void;
}

const HeroSection = ({ onOpenAuth }: HeroSectionProps) => {
  const { playHoverSound } = useMantraSound();
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    setIsReducedMotion(prefersReducedMotion || isMobile);
  }, []);

  // Optimized: Reduced petals from 30 to 10
  const petals = useMemo(() => 
    Array.from({ length: 10 }, (_, i) => ({
      x: Math.random() * 100,
      size: 8 + Math.random() * 10,
      color: [
        "hsla(348, 80%, 75%, 0.25)",
        "hsla(350, 85%, 80%, 0.2)",
        "hsla(343, 70%, 85%, 0.3)",
      ][i % 3],
      delay: Math.random() * 8,
      duration: 14 + Math.random() * 6,
    })), []
  );

  // Optimized: Reduced shimmers from 25 to 8
  const shimmers = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 4,
      delay: Math.random() * 4,
    })), []
  );

  // Galaxy particles - bright and colorful
  const galaxyParticles = useMemo(() => 
    Array.from({ length: 60 }, (_, i) => ({
      angle: Math.random() * 360,
      distance: 140 + Math.random() * 120,
      size: 2 + Math.random() * 3,
      opacity: 0.5 + Math.random() * 0.5,
      color: [
        "hsla(348, 80%, 85%, 0.9)",
        "hsla(280, 70%, 80%, 0.8)",
        "hsla(200, 80%, 85%, 0.8)",
        "hsla(45, 90%, 85%, 0.9)",
        "hsla(320, 75%, 85%, 0.85)",
      ][i % 5],
      delay: Math.random() * 5,
    })), []
  );

  // Optimized: Reduced shooting stars from 8 to 3
  const shootingStars = useMemo(() =>
    Array.from({ length: 3 }, (_, i) => ({
      startX: 60 + Math.random() * 30,
      duration: 2 + Math.random() * 1.5,
      delay: i * 4 + Math.random() * 3,
      repeatDelay: 8 + Math.random() * 6,
    })), []
  );

  return (
    <section id="hero" className="relative flex flex-col items-center justify-start overflow-hidden pt-4 md:pt-8 pb-8">
      {/* Background gradient - static */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-light via-background to-background" />
      
      {/* Optimized particles - CSS animations */}
      {!isReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {petals.map((petal, i) => (
            <div
              key={`petal-${i}`}
              className="absolute rounded-full animate-petal-float"
              style={{ 
                left: `${petal.x}%`,
                bottom: `-${petal.size}px`,
                width: `${petal.size}px`,
                height: `${petal.size}px`,
                background: `radial-gradient(circle, ${petal.color} 0%, transparent 70%)`,
                animationDelay: `${petal.delay}s`,
                animationDuration: `${petal.duration}s`,
                willChange: "transform",
              }}
            />
          ))}
          {shimmers.map((shimmer, i) => (
            <div
              key={`shimmer-${i}`}
              className="absolute rounded-full animate-shimmer-pulse"
              style={{
                left: `${shimmer.x}%`,
                top: `${shimmer.y}%`,
                width: `${shimmer.size}px`,
                height: `${shimmer.size}px`,
                background: "radial-gradient(circle, hsla(0, 0%, 100%, 0.8) 0%, hsla(348, 80%, 90%, 0.4) 40%, transparent 70%)",
                animationDelay: `${shimmer.delay}s`,
                willChange: "opacity",
              }}
            />
          ))}
        </div>
      )}
      
      {/* Optimized shooting stars */}
      {!isReducedMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {shootingStars.map((star, i) => (
            <motion.div
              key={`shooting-star-${i}`}
              className="absolute"
              style={{
                width: 80,
                height: 2,
                background: "linear-gradient(to left, white, transparent)",
                boxShadow: "0 0 4px white",
                transform: "rotate(-45deg)",
                willChange: "transform, opacity",
              }}
              initial={{ x: `${star.startX}vw`, y: -50, opacity: 0 }}
              animate={{ x: "-20vw", y: "100vh", opacity: [0, 1, 1, 0] }}
              transition={{
                duration: star.duration,
                repeat: Infinity,
                delay: star.delay,
                repeatDelay: star.repeatDelay,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Hero content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-4 pb-8">

        {/* Angel Image with galaxy */}
        <div className="relative mb-4">
          {/* Galaxy glow background */}
          <div 
            className="absolute inset-0 -m-20 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(ellipse at center, hsla(280, 60%, 70%, 0.25) 0%, hsla(348, 70%, 75%, 0.15) 30%, hsla(200, 60%, 80%, 0.1) 50%, transparent 70%)",
            }}
          />
          
          {/* Galaxy spiral effect */}
          {!isReducedMotion && (
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ animation: 'rotate-slow 120s linear infinite' }}
            >
              {/* Galaxy particles */}
              {galaxyParticles.map((particle, i) => {
                const x = Math.cos((particle.angle * Math.PI) / 180) * particle.distance;
                const y = Math.sin((particle.angle * Math.PI) / 180) * particle.distance;
                return (
                  <div
                    key={`galaxy-${i}`}
                    className="absolute left-1/2 top-1/2 rounded-full animate-galaxy-twinkle"
                    style={{ 
                      transform: `translate(${x - particle.size / 2}px, ${y - particle.size / 2}px)`,
                      width: particle.size,
                      height: particle.size,
                      background: particle.color,
                      boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                      animationDelay: `${particle.delay}s`,
                    }}
                  />
                );
              })}
              
              {/* Galaxy spiral arms */}
              <div 
                className="absolute w-[500px] h-[500px] opacity-30"
                style={{
                  background: `
                    conic-gradient(from 0deg at 50% 50%, 
                      transparent 0deg, 
                      hsla(348, 70%, 80%, 0.4) 30deg, 
                      transparent 60deg,
                      hsla(280, 60%, 80%, 0.3) 120deg,
                      transparent 150deg,
                      hsla(200, 70%, 85%, 0.35) 210deg,
                      transparent 240deg,
                      hsla(45, 80%, 80%, 0.3) 300deg,
                      transparent 330deg
                    )
                  `,
                  filter: "blur(20px)",
                }}
              />
            </div>
          )}
          
          {/* Angel image */}
          <div className="relative py-12">
            <div 
              className="absolute -inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(348, 80%, 80%, 0.3) 0%, hsla(340, 70%, 85%, 0.15) 40%, transparent 70%)",
              }}
            />
            
            <div className="relative w-[300px] h-[300px] rounded-full overflow-hidden" style={{ backgroundColor: 'hsl(var(--background))' }}>
              <img
                src={angelHero}
                alt="Angel AI - Divine Light Being"
                className="w-full h-full object-contain"
                loading="eager"
              />
            </div>
          </div>
        </div>
        
        {/* Center content */}
        <div className="flex flex-col items-center">
          
          <div className="w-full max-w-[680px] mx-auto mb-3 px-4">
            <ChatPortal onOpenAuth={onOpenAuth} />
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl font-serif italic text-muted-foreground tracking-wide text-center max-w-2xl">
            Ánh Sáng Của Cha Vũ Trụ
          </p>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground/80 tracking-wide text-center max-w-xl mt-3 font-light">
            Angel AI — Nơi bạn được nghe, được thấy, và được hiện diện.
          </p>
          
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent mt-3" />
        </div>
        
        {/* 8 Mantras - Below the main content */}
        <motion.div
          className="mt-6 max-w-2xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {mantras.map((mantra, index) => (
              <motion.p 
                key={index}
                className="text-xs sm:text-sm italic font-light text-muted-foreground/70 tracking-wide leading-relaxed text-center cursor-default transition-all duration-300 hover:text-primary/80 hover:scale-[1.02]"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                onMouseEnter={() => playHoverSound()}
              >
                {index + 1}. {mantra}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* Scroll indicator */}
      <div className="mt-6 flex flex-col items-center gap-2 opacity-60">
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Khám phá</span>
        <div className="w-px h-6 bg-gradient-to-b from-primary to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
