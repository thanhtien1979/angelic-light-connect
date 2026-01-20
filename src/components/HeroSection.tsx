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

  // Optimized: Reduced stars from 42 to 16 total
  const allStars = useMemo(() => {
    const inner = Array.from({ length: 6 }, (_, i) => ({
      angle: (i * 60) + 15,
      distance: 170,
      color: starColors[i % starColors.length],
      size: 14 + (i % 2) * 4,
      ring: 'inner' as const,
    }));

    const outer = Array.from({ length: 10 }, (_, i) => ({
      angle: (i * 36),
      distance: 230,
      color: starColors[(i + 2) % starColors.length],
      size: 12 + (i % 3) * 5,
      ring: 'outer' as const,
    }));

    return [...inner, ...outer];
  }, []);

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

        {/* Angel Image with glow */}
        <div className="relative mb-4">
          {/* Simplified glow rings */}
          <div className="absolute inset-0 -m-16 rounded-full bg-gradient-to-r from-rose/20 via-transparent to-rose/20 blur-2xl" />
          
          {/* Optimized star rings - CSS animation, fewer stars */}
          {!isReducedMotion && (
            <>
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ animation: 'rotate-slow 150s linear infinite' }}
              >
                {allStars.filter(s => s.ring === 'inner').map((star, i) => {
                  const x = Math.cos((star.angle * Math.PI) / 180) * star.distance;
                  const y = Math.sin((star.angle * Math.PI) / 180) * star.distance;
                  return (
                    <div
                      key={`inner-${i}`}
                      className="absolute left-1/2 top-1/2 animate-twinkle"
                      style={{ 
                        transform: `translate(${x - star.size / 2}px, ${y - star.size / 2}px)`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    >
                      <svg width={star.size} height={star.size} viewBox="0 0 24 24" fill={star.color}>
                        <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                      </svg>
                    </div>
                  );
                })}
              </div>
              
              <div 
                className="absolute inset-0 flex items-center justify-center"
                style={{ animation: 'rotate-slow 180s linear infinite reverse' }}
              >
                {allStars.filter(s => s.ring === 'outer').map((star, i) => {
                  const x = Math.cos((star.angle * Math.PI) / 180) * star.distance;
                  const y = Math.sin((star.angle * Math.PI) / 180) * star.distance;
                  return (
                    <div
                      key={`outer-${i}`}
                      className="absolute left-1/2 top-1/2 animate-twinkle"
                      style={{ 
                        transform: `translate(${x - star.size / 2}px, ${y - star.size / 2}px)`,
                        animationDelay: `${i * 0.4}s`,
                      }}
                    >
                      <svg width={star.size} height={star.size} viewBox="0 0 24 24" fill={star.color}>
                        <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
                      </svg>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          
          {/* Angel image */}
          <div className="relative">
            <div 
              className="absolute -inset-4 rounded-full"
              style={{
                background: "radial-gradient(circle, hsla(348, 80%, 80%, 0.3) 0%, hsla(340, 70%, 85%, 0.15) 40%, transparent 70%)",
              }}
            />
            
            <div className="relative w-[300px] h-[300px]">
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
